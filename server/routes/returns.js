import express from 'express';
import Return from '../models/Return.js';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import Stripe from 'stripe';

const router = express.Router();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

const RETURN_WINDOW_DAYS = 30;
const RETURN_REASONS = [
  { code: 'defective', label: 'Item is defective or damaged' },
  { code: 'not_as_described', label: 'Item not as described' },
  { code: 'changed_mind', label: 'Changed my mind' },
  { code: 'unwanted', label: 'No longer needed' },
  { code: 'other', label: 'Other reason' },
];

/**
 * POST /api/returns - Request a return
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, reason, description, photos } = req.body;
    const customerId = req.user._id;

    // Validate order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is eligible for return (delivered or succeeded)
    if (!['succeeded', 'delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({ message: 'Order is not eligible for return' });
    }

    // Check 30-day window
    const daysSinceOrder = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder > RETURN_WINDOW_DAYS) {
      return res.status(400).json({
        message: `Return window has closed. Returns must be requested within ${RETURN_WINDOW_DAYS} days.`,
      });
    }

    // Check if return already exists
    const existingReturn = await Return.findOne({
      orderId,
      status: { $nin: ['rejected', 'completed'] },
    });

    if (existingReturn) {
      return res.status(400).json({ message: 'A return request already exists for this order' });
    }

    // Check reason
    if (!RETURN_REASONS.find((r) => r.code === reason)) {
      return res.status(400).json({ message: 'Invalid return reason' });
    }

    // Create return request
    const returnRequest = await Return.create({
      orderId,
      customerId,
      reason: {
        code: reason,
        label: RETURN_REASONS.find((r) => r.code === reason)?.label,
      },
      description,
      photos: photos || [],
      requestedAmount: order.totalAmount,
    });

    res.status(201).json({
      message: 'Return request submitted successfully',
      data: returnRequest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/returns - Get returns (user's own returns or all if admin)
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { customerId: req.user._id };

    const returns = await Return.find(query)
      .populate('orderId')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/returns/:id - Get specific return
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.customerId = req.user._id;
    }

    const returnRequest = await Return.findOne(query)
      .populate('orderId')
      .populate('customerId', 'name email');

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }

    res.json(returnRequest);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/returns/:id/approve - Approve return (admin only)
 */
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { approvedAmount, adminNotes } = req.body;

    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }

    if (returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'Return is not in requested status' });
    }

    returnRequest.status = 'approved';
    returnRequest.approvedAmount = approvedAmount || returnRequest.requestedAmount;
    returnRequest.adminNotes = adminNotes || '';
    await returnRequest.save();

    res.json({
      message: 'Return approved',
      data: returnRequest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/returns/:id/reject - Reject return (admin only)
 */
router.put('/:id/reject', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }

    if (returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'Return is not in requested status' });
    }

    returnRequest.status = 'rejected';
    returnRequest.rejectionReason = rejectionReason;
    await returnRequest.save();

    res.json({
      message: 'Return rejected',
      data: returnRequest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/returns/:id/process-refund - Process refund (admin only)
 */
router.post('/:id/process-refund', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const returnRequest = await Return.findById(req.params.id).populate('orderId');
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }

    if (returnRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Return must be approved before processing refund' });
    }

    if (returnRequest.status === 'refunded') {
      return res.status(400).json({ message: 'Refund already processed for this return' });
    }

    let refundTransactionId = `refund_manual_${Date.now()}`;

    // Attempt Stripe refund if available
    if (stripe && returnRequest.orderId.paymentProvider === 'stripe') {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: returnRequest.orderId.paymentIntentId,
          amount: Math.round(returnRequest.approvedAmount * 100), // Amount in cents
          reason: 'requested_by_customer',
        });
        refundTransactionId = refund.id;
      } catch (error) {
        console.error('Stripe refund error:', error.message);
        // Fall back to manual tracking
      }
    }

    returnRequest.status = 'refunded';
    returnRequest.refundTransactionId = refundTransactionId;
    returnRequest.refundInitiatedDate = new Date();
    await returnRequest.save();

    res.json({
      message: 'Refund processed',
      data: returnRequest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/returns/:id/mark-received - Mark return as received (admin only)
 */
router.put('/:id/mark-received', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }

    returnRequest.returnReceivedDate = new Date();
    if (returnRequest.status === 'refunded') {
      returnRequest.status = 'completed';
    }
    await returnRequest.save();

    res.json({
      message: 'Return marked as received',
      data: returnRequest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/returns/config/reasons - Get available return reasons
 */
router.get('/config/reasons', (req, res) => {
  res.json({
    reasons: RETURN_REASONS,
    returnWindow: `${RETURN_WINDOW_DAYS} days`,
  });
});

export default router;

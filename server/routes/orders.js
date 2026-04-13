import express from 'express';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import User from '../models/User.js';
import { buildTrackingWhatsAppMessage, sendWhatsAppMessage } from '../utils/whatsapp.js';

const router = express.Router();

// GET /api/orders/my-orders
router.get('/my-orders', authMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders (admin)
router.get('/admin/orders', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/admin/orders/:id/status', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      status,
      note,
      deliveryPartner,
      trackingNumber,
      trackingUrl,
    } = req.body;
    const allowed = ['shipped', 'delivered', 'succeeded'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (deliveryPartner !== undefined) order.deliveryPartner = deliveryPartner;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    const customer = await User.findById(order.customer).select('whatsappNumber');
    if (customer?.whatsappNumber && ['shipped', 'delivered'].includes(status)) {
      sendWhatsAppMessage(customer.whatsappNumber, buildTrackingWhatsAppMessage(order, status))
        .catch((error) => console.error('Silent fail on WhatsApp notification:', error.message));
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;

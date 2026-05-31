import express from 'express';
import Coupon from '../models/Coupon.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import {
  validateCoupon,
  recordCouponUsage,
  getActiveCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../utils/coupon.js';

const router = express.Router();

/**
 * GET /api/coupons - Get all active coupons (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const coupons = await getActiveCoupons();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/coupons/validate - Validate coupon code
 */
router.post('/validate', authMiddleware, async (req, res, next) => {
  try {
    const { code, orderTotal, items } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({ message: 'Code and orderTotal are required' });
    }

    const result = await validateCoupon(code, orderTotal, req.user._id, items);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/coupons/record-usage - Record coupon usage after successful payment
 */
router.post('/record-usage', authMiddleware, async (req, res, next) => {
  try {
    const { couponId, discountAmount, orderId } = req.body;

    if (!couponId || discountAmount === undefined) {
      return res.status(400).json({ message: 'couponId and discountAmount are required' });
    }

    const usage = await recordCouponUsage(couponId, req.user._id, discountAmount, orderId);

    res.status(201).json({
      message: 'Coupon usage recorded',
      data: usage,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/coupons/admin/all - Get all coupons (admin only)
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/coupons/admin/create - Create new coupon (admin only)
 */
router.post('/admin/create', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { code, description, type, value, maxDiscount, minOrderAmount, maxOrderAmount, usageLimit, validFrom, validUntil } = req.body;

    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Missing required fields: code, type, value, validFrom, validUntil' });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "percentage" or "fixed"' });
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({ message: 'Percentage value must be between 0 and 100' });
    }

    if (type === 'fixed' && value < 0) {
      return res.status(400).json({ message: 'Fixed value must be positive' });
    }

    const coupon = await createCoupon({
      code: code.toUpperCase().trim(),
      description,
      type,
      value,
      maxDiscount,
      minOrderAmount,
      maxOrderAmount,
      usageLimit,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next({ status: 400, message: 'Coupon code already exists' });
    }
    next(error);
  }
});

/**
 * PUT /api/coupons/admin/:id - Update coupon (admin only)
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { code, description, type, value, maxDiscount, minOrderAmount, maxOrderAmount, usageLimit, validFrom, validUntil, active } = req.body;

    const updates = {};
    if (code) updates.code = code.toUpperCase().trim();
    if (description !== undefined) updates.description = description;
    if (type) updates.type = type;
    if (value !== undefined) updates.value = value;
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount;
    if (minOrderAmount !== undefined) updates.minOrderAmount = minOrderAmount;
    if (maxOrderAmount !== undefined) updates.maxOrderAmount = maxOrderAmount;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit;
    if (validFrom) updates.validFrom = new Date(validFrom);
    if (validUntil) updates.validUntil = new Date(validUntil);
    if (active !== undefined) updates.active = active;

    const coupon = await updateCoupon(req.params.id, updates);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next({ status: 400, message: 'Coupon code already exists' });
    }
    next(error);
  }
});

/**
 * DELETE /api/coupons/admin/:id - Delete coupon (admin only)
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/coupons/:id - Get single coupon (admin only)
 */
router.get('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (err) {
    next(err);
  }
});

export default router;

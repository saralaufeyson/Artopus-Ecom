import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const aggregates = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.json({
      reviews,
      summary: {
        averageRating: Number((aggregates[0]?.averageRating || 0).toFixed(1)),
        totalReviews: aggregates[0]?.totalReviews || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', authMiddleware, async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'title imageUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, validate(reviewSchema), async (req, res, next) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
      status: { $in: ['succeeded', 'shipped', 'delivered'] },
      'items.productId': productId,
    });

    if (!order) {
      return res.status(400).json({ message: 'You can only review products from your completed purchases' });
    }

    const review = await Review.findOneAndUpdate(
      { product: productId, order: orderId, user: req.user._id },
      {
        product: productId,
        order: orderId,
        user: req.user._id,
        rating,
        title,
        comment,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('user', 'name');

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export default router;

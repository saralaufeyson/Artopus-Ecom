import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import PageView from '../models/PageView.js';
import SavedCollection from '../models/SavedCollection.js';

const router = express.Router();

// GET /api/metrics - admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const [products, orders, users, grossSales, lowStockProducts, pageViews, walletTransactions, monthlySales, topProducts, topViewedProducts, savedCollections] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['succeeded', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.find({ stockQuantity: { $lte: 3 }, isActive: true }).select('title stockQuantity type').limit(8),
      PageView.countDocuments(),
      WalletTransaction.find().sort({ createdAt: -1 }).limit(15).populate('artist', 'artistName').populate('order', '_id'),
      Order.aggregate([
        { $match: { status: { $in: ['succeeded', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['succeeded', 'shipped', 'delivered'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            title: { $first: '$items.title' },
            unitsSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      PageView.aggregate([
        { $match: { product: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$product',
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: 1,
            views: 1,
            title: '$product.title',
          },
        },
      ]),
      SavedCollection.countDocuments(),
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const paidOrdersCount = await Order.countDocuments({ status: { $in: ['succeeded', 'shipped', 'delivered'] } });
    const averageOrderValue = paidOrdersCount ? Number(((grossSales[0]?.total || 0) / paidOrdersCount).toFixed(2)) : 0;
    const conversionRate = pageViews ? Number(((paidOrdersCount / pageViews) * 100).toFixed(2)) : 0;

    res.json({
      products,
      orders,
      users,
      grossSales: grossSales[0]?.total || 0,
      pageViews,
      statusCounts,
      lowStockProducts,
      walletTransactions,
      monthlySales,
      topProducts,
      topViewedProducts,
      savedCollections,
      averageOrderValue,
      conversionRate,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

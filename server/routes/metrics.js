import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/metrics - admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();
    res.json({ products, orders, users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch metrics' });
  }
});

export default router;
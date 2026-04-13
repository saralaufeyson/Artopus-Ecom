import express from 'express';
import jwt from 'jsonwebtoken';
import PageView from '../models/PageView.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { page, productId, meta } = req.body;
    if (!page) return res.status(400).json({ message: 'Page is required' });

    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        userId = undefined;
      }
    }

    await PageView.create({
      page,
      product: productId || undefined,
      user: userId,
      meta: meta || {},
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', authMiddleware, async (req, res, next) => {
  try {
    const views = await PageView.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(25);
    res.json(views);
  } catch (err) {
    next(err);
  }
});

export default router;

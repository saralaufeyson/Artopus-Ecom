import express from 'express';
import Notification from '../models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', authMiddleware, async (req, res, next) => {
  try {
    console.log('PATCH /api/notifications/read-all hit by user:', req.user._id);
    const updateResult = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    console.log('Notification updateMany result:', updateResult);

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('Fetched notifications count post-update:', notifications.length);
    res.json({ notifications, unreadCount: 0 });
  } catch (err) {
    console.error('Error in PATCH /api/notifications/read-all:', err);
    next(err);
  }
});

router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notification, unreadCount });
  } catch (err) {
    next(err);
  }
});

export default router;

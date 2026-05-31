import express from 'express';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import Artist from '../models/Artist.js';
import User from '../models/User.js';
import { buildTrackingWhatsAppMessage, sendWhatsAppMessage } from '../utils/whatsapp.js';
import { notifyRole, notifyUsers } from '../utils/notifications.js';

const router = express.Router();

// GET /api/orders?artistId=
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { artistId } = req.query;

    if (artistId) {
      if (req.user.role !== 'admin') {
        const artist = await Artist.findOne({ _id: artistId, userId: req.user._id, isActive: true });
        if (!artist) return res.status(403).json({ message: 'Not allowed to view these orders' });
      }

      const orders = await Order.find({ 'items.artistId': artistId })
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });

      return res.json(orders);
    }

    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

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

// PATCH /api/orders/:id/status
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status, note, artistId } = req.body;
    const allowed = ['shipped', 'delivered'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    if (!artistId) return res.status(400).json({ message: 'artistId is required' });

    if (req.user.role !== 'admin') {
      const artist = await Artist.findOne({ _id: artistId, userId: req.user._id, isActive: true });
      if (!artist) return res.status(403).json({ message: 'Artist access required' });
    }

    const order = await Order.findOne({ _id: req.params.id, 'items.artistId': artistId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Updated by artist ${artistId}` });
    await order.save();

    const customer = await User.findById(order.customer).select('whatsappNumber');
    if (customer?.whatsappNumber) {
      sendWhatsAppMessage(customer.whatsappNumber, buildTrackingWhatsAppMessage(order, status))
        .catch((error) => console.error('Silent fail on WhatsApp notification:', error.message));
    }

    await Promise.all([
      notifyUsers([order.customer], {
        type: `order_${status}`,
        title: `Order ${status}`,
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} was marked ${status}.`,
        link: '/profile',
        metadata: { orderId: order._id, status, artistId },
      }),
      notifyRole('admin', {
        type: `order_${status}`,
        title: `Order ${status}`,
        message: `Artist fulfillment updated order #${order._id.toString().slice(-6).toUpperCase()} to ${status}.`,
        link: '/admin',
        metadata: { orderId: order._id, status, artistId },
      }),
    ]);

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

    const relatedArtists = await Artist.find({ _id: { $in: order.items.map((item) => item.artistId).filter(Boolean) } }).select('userId');
    await Promise.all([
      notifyUsers([order.customer], {
        type: `order_${status}`,
        title: `Order ${status === 'succeeded' ? 'processing' : status}`,
        message: status === 'succeeded'
          ? `Your order #${order._id.toString().slice(-6).toUpperCase()} is now being processed.`
          : `Your order #${order._id.toString().slice(-6).toUpperCase()} was marked ${status}.`,
        link: '/profile',
        metadata: { orderId: order._id, status },
      }),
      notifyRole('admin', {
        type: `order_${status}`,
        title: `Order ${status}`,
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} was updated to ${status}.`,
        link: '/admin',
        metadata: { orderId: order._id, status },
      }),
      notifyUsers(relatedArtists.map((artist) => artist.userId).filter(Boolean), {
        type: `order_${status}`,
        title: `Order ${status}`,
        message: status === 'succeeded'
          ? 'An order containing your artwork is now marked paid and processing.'
          : `An order containing your artwork was marked ${status}.`,
        link: '/artist-dashboard',
        metadata: { orderId: order._id, status },
      }),
    ]);

    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;

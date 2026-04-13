import express from 'express';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import bcrypt from 'bcryptjs';
import { payoutDecisionSchema, registerSchema } from '../validation/schemas.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users - Create new admin (admin only)
router.post('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id - Update user role (admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer', 'artist'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/withdrawals - List artist withdrawal requests
router.get('/withdrawals', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const withdrawals = await WalletTransaction.find({
      type: { $in: ['withdrawal_request', 'withdrawal_paid'] },
    })
      .sort({ createdAt: -1 })
      .populate('artist', 'artistName walletBalance totalWithdrawn')
      .populate('order', '_id');

    res.json(withdrawals);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', authMiddleware, adminMiddleware, validate(payoutDecisionSchema), async (req, res, next) => {
  try {
    const transaction = await WalletTransaction.findById(req.params.id);
    if (!transaction || transaction.type !== 'withdrawal_request') {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request already processed' });
    }

    const artist = await Artist.findById(transaction.artist);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    transaction.type = 'withdrawal_paid';
    transaction.status = 'completed';
    transaction.note = req.body.note || transaction.note || 'Withdrawal approved by admin';
    transaction.metadata = {
      ...transaction.metadata,
      processedBy: req.user._id,
      processedAt: new Date(),
    };
    await transaction.save();

    artist.totalWithdrawn = Number((artist.totalWithdrawn + transaction.amount).toFixed(2));
    await artist.save();

    const populated = await WalletTransaction.findById(transaction._id).populate('artist', 'artistName walletBalance totalWithdrawn');
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/withdrawals/:id/reject
router.post('/withdrawals/:id/reject', authMiddleware, adminMiddleware, validate(payoutDecisionSchema), async (req, res, next) => {
  try {
    const transaction = await WalletTransaction.findById(req.params.id);
    if (!transaction || transaction.type !== 'withdrawal_request') {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request already processed' });
    }

    const artist = await Artist.findById(transaction.artist);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    artist.walletBalance = Number((artist.walletBalance + transaction.amount).toFixed(2));
    await artist.save();

    transaction.status = 'rejected';
    transaction.note = req.body.note || 'Withdrawal rejected by admin';
    transaction.metadata = {
      ...transaction.metadata,
      processedBy: req.user._id,
      processedAt: new Date(),
    };
    await transaction.save();

    const populated = await WalletTransaction.findById(transaction._id).populate('artist', 'artistName walletBalance totalWithdrawn');
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

export default router;

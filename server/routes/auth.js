import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Artist from '../models/Artist.js';

const router = express.Router();

import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, artistActivationSchema } from '../validation/schemas.js';
import { authMiddleware } from '../middleware/auth.js';

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone, whatsappNumber } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash, phone, whatsappNumber });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/artist-activate
router.post('/artist-activate', validate(artistActivationSchema), async (req, res, next) => {
  try {
    const { email, password, name, phone, whatsappNumber } = req.body;
    const artist = await Artist.findOne({ email, isActive: true });
    if (!artist) return res.status(404).json({ message: 'No approved artist profile found for this email' });

    let user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (user && user.role === 'admin') {
      return res.status(400).json({ message: 'This email is reserved for an admin account' });
    }

    if (user) {
      user.name = name;
      user.password = hash;
      user.phone = phone;
      user.whatsappNumber = whatsappNumber;
      user.role = 'artist';
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hash,
        phone,
        whatsappNumber,
        role: 'artist',
      });
    }

    artist.userId = user._id;
    await artist.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
      },
      artistId: artist._id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

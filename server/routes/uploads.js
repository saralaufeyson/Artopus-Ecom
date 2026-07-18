import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { artistMiddleware } from '../middleware/artist.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// GET /api/uploads/signature (artist or admin)
// Returns signature and timestamp so the client can upload directly to Cloudinary
router.get('/signature', authMiddleware, (req, res, next) => {
  if (req.user.role === 'artist' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Artist or Admin access required' });
}, (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET);
  res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
});

export default router;

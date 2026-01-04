import express from 'express';
import Artist from '../models/Artist.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { artistSchema } from '../validation/schemas.js';

const router = express.Router();

// GET /api/artists - List all active artists
router.get('/', async (req, res, next) => {
  try {
    const artists = await Artist.find({ isActive: true });
    res.json(artists);
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/:id - Get artist by ID
router.get('/:id', async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist || !artist.isActive) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

// POST /api/artists (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { error } = artistSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { artistName, penName, email, bio, profileImage, socialLinks } = req.body;
    
    // Check if artist already exists
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return res.status(400).json({ message: 'Artist with this email already exists' });
    }

    const artist = await Artist.create({
      artistName,
      penName,
      email,
      bio,
      profileImage,
      socialLinks
    });
    res.status(201).json(artist);
  } catch (err) {
    next(err);
  }
});

// PUT /api/artists/:id (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const updates = req.body;
    const artist = await Artist.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/artists/:id (admin only) - Soft delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json({ message: 'Artist deactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;

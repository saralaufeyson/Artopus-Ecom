import express from 'express';
import ArtistRequest from '../models/ArtistRequest.js';
import Artist from '../models/Artist.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// POST /api/artist-requests - Public submission
router.post('/', async (req, res, next) => {
  try {
    const { artistName, penName, email, bio, portfolioLink, socialLinks } = req.body;
    
    // Check if a pending request already exists for this email
    const existingRequest = await ArtistRequest.findOne({ email, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists for this email.' });
    }

    // Check if artist already exists
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return res.status(400).json({ message: 'An artist with this email already exists.' });
    }

    const newRequest = await ArtistRequest.create({
      artistName,
      penName,
      email,
      bio,
      portfolioLink,
      socialLinks
    });

    res.status(201).json({ message: 'Request submitted successfully!', request: newRequest });
  } catch (err) {
    next(err);
  }
});

// GET /api/artist-requests - Admin only: List all requests
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const requests = await ArtistRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// POST /api/artist-requests/:id/approve - Admin only: Approve and create artist profile
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const request = await ArtistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    // Check if artist already exists (double check)
    const existingArtist = await Artist.findOne({ email: request.email });
    if (existingArtist) {
      request.status = 'approved';
      request.processedBy = req.user._id;
      request.processedAt = new Date();
      await request.save();
      return res.status(400).json({ message: 'Artist already exists' });
    }

    // Create Artist profile
    const artist = await Artist.create({
      artistName: request.artistName,
      penName: request.penName,
      email: request.email,
      bio: request.bio,
      socialLinks: request.socialLinks,
      // Default profile image could be added here
    });

    // Update Request status
    request.status = 'approved';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Artist request approved and profile created!', artist });
  } catch (err) {
    next(err);
  }
});

// POST /api/artist-requests/:id/reject - Admin only: Reject request
router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const request = await ArtistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Artist request rejected' });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import ArtistRequest from '../models/ArtistRequest.js';
import Artist from '../models/Artist.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import User from '../models/User.js';
import { notifyRole, notifyUsers } from '../utils/notifications.js';

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

    await notifyRole('admin', {
      type: 'artist_request_submitted',
      title: 'New artist application',
      message: `${artistName} submitted an artist application.`,
      link: '/admin',
      metadata: { artistRequestId: newRequest._id, email },
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

    // Ensure a User account exists for this artist. Create one with a temporary password if needed.
    const tempPassword = process.env.ARTIST_DEFAULT_PASSWORD || 'ChangeMe123!';
    let user = await User.findOne({ email: request.email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(tempPassword, salt);
      user = await User.create({
        name: request.artistName || request.penName || 'Artist',
        email: request.email,
        password: hash,
        role: 'artist',
      });
    } else {
      // If user exists and is not admin, ensure role is artist and save
      if (user.role !== 'admin') {
        user.role = 'artist';
        await user.save();
      }
    }

    // Link artist profile to user
    artist.userId = user._id;
    await artist.save();

    // Notify the user with activation info including temporary credentials
    await notifyUsers([user._id], {
      type: 'artist_request_approved',
      title: 'Artist application approved',
      message: `Your artist application has been approved. Login with email: ${request.email} and password: ${tempPassword}`,
      link: '/artist-activate',
      metadata: { artistRequestId: request._id, artistId: artist._id, credentials: { email: request.email, password: tempPassword } },
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ message: 'Artist request approved and profile created!', artist, user: userWithoutPassword, credentials: { email: request.email, password: tempPassword } });
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

    const matchingUser = await User.findOne({ email: request.email }).select('_id');
    if (matchingUser) {
      await notifyUsers([matchingUser._id], {
        type: 'artist_request_rejected',
        title: 'Artist application rejected',
        message: 'Your artist application was not approved this time.',
        link: '/join-as-artist',
        metadata: { artistRequestId: request._id },
      });
    }

    res.json({ message: 'Artist request rejected' });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import Artist from '../models/Artist.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { sendAdminPayoutRequestNotification } from '../utils/email.js';
import { authMiddleware } from '../middleware/auth.js';
import { artistMiddleware } from '../middleware/artist.js';
import { validate } from '../middleware/validate.js';
import { artistProductSchema, walletWithdrawalSchema } from '../validation/schemas.js';
import { notifyRole, notifyUsers } from '../utils/notifications.js';
import { getUploadedImageUrl, createUploadParser } from '../utils/upload.js';

const router = express.Router();

async function getArtistForUser(userId) {
  return Artist.findOne({ userId, isActive: true });
}

router.get('/dashboard', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const [products, recentOrders, walletTransactions] = await Promise.all([
      Product.find({ artistId: artist._id }).sort({ createdAt: -1 }),
      Order.find({ 'items.artistId': artist._id, status: { $in: ['succeeded', 'shipped', 'delivered'] } }).sort({ createdAt: -1 }).limit(10),
      WalletTransaction.find({ artist: artist._id }).sort({ createdAt: -1 }).limit(20),
    ]);

    const approvedProducts = products.filter((product) => product.approvalStatus === 'approved').length;
    const pendingProducts = products.filter((product) => product.approvalStatus === 'pending').length;
    const grossSales = walletTransactions
      .filter((item) => item.type === 'sale_credit')
      .reduce((sum, item) => sum + item.amount + item.commissionAmount, 0);

    res.json({
      artist,
      stats: {
        totalProducts: products.length,
        approvedProducts,
        pendingProducts,
        recentOrders: recentOrders.length,
        walletBalance: artist.walletBalance,
        lifetimeEarnings: artist.lifetimeEarnings,
        totalWithdrawn: artist.totalWithdrawn,
        grossSales,
      },
      products,
      recentOrders,
      walletTransactions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    // Strictly remove protected fields to prevent tampering
    const protectedFields = ['email', 'walletBalance', 'lifetimeEarnings', 'totalWithdrawn', 'commissionRate', 'userId', 'isActive', '_id'];
    const updates = { ...req.body };
    protectedFields.forEach((field) => delete updates[field]);

    // Allow only specific fields to be updated
    const allowedUpdates = ['artistName', 'penName', 'bio', 'profileImage', 'socialLinks'];
    const filteredUpdates = {};
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Handle socialLinks nested object
    if (updates.socialLinks) {
      filteredUpdates.socialLinks = {
        website: updates.socialLinks.website ?? artist.socialLinks?.website,
        instagram: updates.socialLinks.instagram ?? artist.socialLinks?.instagram,
        twitter: updates.socialLinks.twitter ?? artist.socialLinks?.twitter,
        facebook: updates.socialLinks.facebook ?? artist.socialLinks?.facebook,
      };
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      artist._id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    res.json(updatedArtist);
  } catch (err) {
    next(err);
  }
});

router.get('/products', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const products = await Product.find({ artistId: artist._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post('/products', authMiddleware, artistMiddleware, (req, res, next) => {
  createUploadParser({
    folder: 'artopus/artist-submissions',
    fileSizeLimit: 4 * 1024 * 1024,
    transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'canvasSketchImage', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) return next(err);

    const mergedBody = { ...req.body };
    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        mergedBody.imageUrl = getUploadedImageUrl(req.files['image'][0]);
      }
      if (req.files['canvasSketchImage'] && req.files['canvasSketchImage'][0]) {
        mergedBody.canvasSketchImageUrl = getUploadedImageUrl(req.files['canvasSketchImage'][0]);
      }
    }

    req.body = mergedBody;
    next();
  });
}, (req, res, next) => {
  const { error } = artistProductSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map((detail) => detail.message) });
  next();
}, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const product = await Product.create({
      ...req.body,
      price: Number(req.body.price),
      printPrice: Number(req.body.printPrice || 0),
      canvasSketchPrice: Number(req.body.canvasSketchPrice || 0),
      outlineSketchPrice: Number(req.body.outlineSketchPrice || 0),
      coloringPrice: Number(req.body.coloringPrice || 0),
      stockQuantity: req.body.type === 'original-artwork' ? 1 : Number(req.body.stockQuantity || 0),
      artistId: artist._id,
      artistUserId: req.user._id,
      artistName: artist.artistName,
      artistEmail: artist.email,
      approvalStatus: 'pending',
    });

    await Promise.all([
      notifyUsers([req.user._id], {
        type: 'product_submitted',
        title: 'Product submitted',
        message: `${product.title} was submitted for admin review.`,
        link: '/artist-dashboard',
        metadata: { productId: product._id, approvalStatus: product.approvalStatus },
      }),
      notifyRole('admin', {
        type: 'product_submission_received',
        title: 'New artist product submission',
        message: `${artist.artistName} submitted ${product.title} for approval.`,
        link: '/admin',
        metadata: { productId: product._id, artistId: artist._id },
      }),
    ]);

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', authMiddleware, artistMiddleware, (req, res, next) => {
  createUploadParser({
    folder: 'artopus/artist-submissions',
    fileSizeLimit: 4 * 1024 * 1024,
    transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'canvasSketchImage', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) return next(err);

    const mergedBody = { ...req.body };
    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        mergedBody.imageUrl = getUploadedImageUrl(req.files['image'][0]);
      }
      if (req.files['canvasSketchImage'] && req.files['canvasSketchImage'][0]) {
        mergedBody.canvasSketchImageUrl = getUploadedImageUrl(req.files['canvasSketchImage'][0]);
      }
    }

    req.body = mergedBody;
    next();
  });
}, (req, res, next) => {
  const { error } = artistProductSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map((detail) => detail.message) });
  next();
}, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const product = await Product.findOne({ _id: req.params.id, artistId: artist._id });
    if (!product) return res.status(404).json({ message: 'Product not found or access denied' });

    const updates = {
      ...req.body,
      price: Number(req.body.price),
      printPrice: Number(req.body.printPrice || 0),
      canvasSketchPrice: Number(req.body.canvasSketchPrice || 0),
      outlineSketchPrice: Number(req.body.outlineSketchPrice || 0),
      coloringPrice: Number(req.body.coloringPrice || 0),
      stockQuantity: req.body.type === 'original-artwork' ? 1 : Number(req.body.stockQuantity || 0),
      approvalStatus: 'pending', // Re-verify upon edits
    };

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });

    await notifyRole('admin', {
      type: 'product_submission_received',
      title: 'Artist updated product submission',
      message: `${artist.artistName} updated ${updated.title}. Approval pending.`,
      link: '/admin',
      metadata: { productId: updated._id, artistId: artist._id },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get('/wallet', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const [wallet, transactions] = await Promise.all([
      Wallet.findOne({ artist: artist._id }),
      WalletTransaction.find({ artist: artist._id }).sort({ createdAt: -1 }).populate('order', '_id status'),
    ]);

    res.json({
      artist,
      wallet,
      transactions,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/wallet/withdrawals', authMiddleware, artistMiddleware, validate(walletWithdrawalSchema), async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });
    if (req.body.amount > artist.walletBalance) {
      return res.status(400).json({ message: 'Withdrawal amount exceeds wallet balance' });
    }

    artist.walletBalance = Number((artist.walletBalance - req.body.amount).toFixed(2));
    await artist.save();

    const wallet = await Wallet.findOne({ artist: artist._id });
    if (wallet) {
      wallet.balance = Number((wallet.balance - req.body.amount).toFixed(2));
      await wallet.save();
    }

    const transaction = await WalletTransaction.create({
      artist: artist._id,
      amount: req.body.amount,
      type: 'withdrawal_request',
      status: 'pending',
      note: req.body.note || 'Artist withdrawal request',
      metadata: {
        requestedBy: req.user._id,
      },
    });

    // Send email notification to admin
    await sendAdminPayoutRequestNotification(artist, req.body.amount, req.body.note);
    await Promise.all([
      notifyUsers([req.user._id], {
        type: 'withdrawal_requested',
        title: 'Payout request submitted',
        message: `Your payout request for $${Number(req.body.amount).toFixed(2)} is pending admin review.`,
        link: '/artist-dashboard',
        metadata: { transactionId: transaction._id, amount: req.body.amount },
      }),
      notifyRole('admin', {
        type: 'withdrawal_request_received',
        title: 'New payout request',
        message: `${artist.artistName} requested a payout of $${Number(req.body.amount).toFixed(2)}.`,
        link: '/admin',
        metadata: { transactionId: transaction._id, artistId: artist._id, amount: req.body.amount },
      }),
    ]);

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

export default router;

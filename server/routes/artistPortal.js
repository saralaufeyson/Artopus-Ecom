import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import CloudinaryStorage from 'multer-storage-cloudinary';
import Artist from '../models/Artist.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import cloudinary, { ensureCloudinaryConfigured, getOptimizedCloudinaryUrl } from '../utils/cloudinary.js';
import { authMiddleware } from '../middleware/auth.js';
import { artistMiddleware } from '../middleware/artist.js';
import { validate } from '../middleware/validate.js';
import { artistProductSchema, walletWithdrawalSchema } from '../validation/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

function getUploadedImageUrl(file) {
  if (!file) return null;

  const filePath = typeof file.path === 'string' ? file.path : null;
  const secureUrl = typeof file.secure_url === 'string' ? file.secure_url : null;
  const filename = typeof file.filename === 'string' ? file.filename : null;
  const publicId = typeof file.public_id === 'string' ? file.public_id : null;

  if (filePath?.startsWith('http')) {
    return getOptimizedCloudinaryUrl(filename || publicId || filePath);
  }

  if (secureUrl) {
    return getOptimizedCloudinaryUrl(secureUrl);
  }

  if (filename || publicId) {
    return getOptimizedCloudinaryUrl(filename || publicId);
  }

  if (filePath) {
    return `/uploads/${path.basename(filePath)}`;
  }

  return null;
}

function createUploadParser() {
  let storage;

  if (ensureCloudinaryConfigured()) {
    storage = new CloudinaryStorage({
      cloudinary: { v2: cloudinary },
      params: {
        folder: 'artopus/artist-submissions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
    });
  } else {
    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`),
    });
  }

  return multer({ storage, limits: { fileSize: 4 * 1024 * 1024 } });
}

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
  createUploadParser().single('image')(req, res, (err) => {
    if (err) return next(err);

    const mergedBody = { ...req.body };
    if (req.file) {
      mergedBody.imageUrl = getUploadedImageUrl(req.file);
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
      outlineSketchPrice: Number(req.body.outlineSketchPrice || 0),
      coloringPrice: Number(req.body.coloringPrice || 0),
      stockQuantity: req.body.type === 'original-artwork' ? 1 : Number(req.body.stockQuantity || 0),
      artistId: artist._id,
      artistUserId: req.user._id,
      artistName: artist.artistName,
      artistEmail: artist.email,
      approvalStatus: 'pending',
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.get('/wallet', authMiddleware, artistMiddleware, async (req, res, next) => {
  try {
    const artist = await getArtistForUser(req.user._id);
    if (!artist) return res.status(404).json({ message: 'Artist profile not found' });

    const transactions = await WalletTransaction.find({ artist: artist._id }).sort({ createdAt: -1 }).populate('order', '_id status');
    res.json({
      artist,
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

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

export default router;

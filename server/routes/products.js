import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import CloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { productCreateSchema, productUpdateSchema } from '../validation/schemas.js';
import cloudinary, {
  ensureCloudinaryConfigured,
  getOptimizedCloudinaryUrl,
  isCloudinaryConfigured,
  uploadAssetToCloudinary,
} from '../utils/cloudinary.js';

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
        folder: 'artopus',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
    });
  } else {
    storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });
  }

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
  });
}

async function normalizeProductImage(rawImageUrl) {
  if (!rawImageUrl) return rawImageUrl;
  if (process.env.NODE_ENV === 'test') return rawImageUrl;

  if (!isCloudinaryConfigured()) return rawImageUrl;

  if (rawImageUrl.includes('/uploads/')) {
    return rawImageUrl;
  }

  if (rawImageUrl.includes('res.cloudinary.com')) {
    return getOptimizedCloudinaryUrl(rawImageUrl);
  }

  const uploadResult = await uploadAssetToCloudinary(rawImageUrl);
  return uploadResult ? getOptimizedCloudinaryUrl(uploadResult.secure_url) : rawImageUrl;
}

// GET /api/products?type=&category=&artistId=&q=
router.get('/', async (req, res, next) => {
  try {
    const { type, category, artistId, q, sort, featured } = req.query;
    const conditions = [
      { isActive: true },
      {
        $or: [
          { approvalStatus: 'approved' },
          { approvalStatus: { $exists: false } },
          { approvalStatus: null },
        ],
      },
    ];

    if (type) conditions.push({ type });
    if (category) conditions.push({ category });
    if (artistId) conditions.push({ artistId });
    if (q) {
      conditions.push({
        $or: [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }, { artistName: new RegExp(q, 'i') }],
      });
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      title_asc: { title: 1 },
    };

    const query = Product.find({ $and: conditions });
    query.sort(sortMap[sort] || { createdAt: -1 });
    if (featured === 'true') query.limit(8);

    const products = await query;
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/admin (admin only) - Get all products including inactive ones
router.get('/admin', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id/related
router.get('/:id/related', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      category: product.category,
      $or: [
        { approvalStatus: 'approved' },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json(related);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (admin only) - supports multipart/form-data with `image` file field OR imageUrl in body
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  // Check if this is a multipart request (file upload) or JSON request (URL)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle file upload
    createUploadParser().single('image')(req, res, (err) => {
      if (err) return next(err);
      // Merge body and file-derived imageUrl
      const mergedBody = { ...req.body };
      if (req.file) {
        mergedBody.imageUrl = getUploadedImageUrl(req.file);
      }
      req.body = mergedBody;
      next();
    });
  } else {
    // Handle JSON request with imageUrl
    next();
  }
}, (req, res, next) => {
  // Validate the merged body (whether from file upload or direct JSON)
  const { error } = productCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
  next();
}, async (req, res, next) => {
  try {
    const normalizedImageUrl = await normalizeProductImage(req.body.imageUrl);
    const {
      type,
      title,
      description,
      price,
      category,
      stockQuantity,
      imageUrl,
      artistId,
      artistUserId,
      artistName,
      artistEmail,
      medium,
      dimensions,
      year,
      videoUrl,
      outlineSketchPrice,
      coloringPrice,
      approvalStatus,
    } = req.body;
    const product = await Product.create({
      type,
      title,
      description,
      price: Number(price),
      category,
      imageUrl: normalizedImageUrl || imageUrl,
      stockQuantity: type === 'original-artwork' ? 1 : Number(stockQuantity || 0),
      artistId,
      artistUserId,
      artistName,
      artistEmail,
      medium,
      dimensions,
      year,
      videoUrl,
      outlineSketchPrice: Number(outlineSketchPrice || 0),
      coloringPrice: Number(coloringPrice || 0),
      approvalStatus,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (admin only) - supports multipart/form-data with `image` file field
router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) => {
  createUploadParser().single('image')(req, res, (err) => {
    if (err) return next(err);

    const mergedBody = { ...req.body };
    if (req.file) {
      mergedBody.imageUrl = getUploadedImageUrl(req.file);
    }

    const { error } = productUpdateSchema.validate(mergedBody, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    req.body = mergedBody;
    next();
  });
}, async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.imageUrl) {
      updates.imageUrl = await normalizeProductImage(updates.imageUrl);
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stockQuantity !== undefined) updates.stockQuantity = Number(updates.stockQuantity);
    // Keep original-artwork stock at most 1
    if (updates.type === 'original-artwork' && updates.stockQuantity > 1) updates.stockQuantity = 1;

    const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/approval (admin only)
router.patch('/:id/approval', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (admin only) - hard delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted permanently' });
  } catch (err) {
    next(err);
  }
});

export default router;

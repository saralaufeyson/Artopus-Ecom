import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { v2 as cloudinary } from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { productCreateSchema, productUpdateSchema } from '../validation/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure storage - use Cloudinary if configured, otherwise local disk
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'artopus',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1600, crop: 'limit' }],
    },
  });
} else {
  // Fallback to local disk storage for development
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const parser = multer({ storage });

// GET /api/products?type=&category=
router.get('/', async (req, res, next) => {
  try {
    const { type, category, q } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    const products = await Product.find(filter);
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

// POST /api/products (admin only) - supports multipart/form-data with `image` file field OR imageUrl in body
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  // Check if this is a multipart request (file upload) or JSON request (URL)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle file upload
    parser.single('image')(req, res, (err) => {
      if (err) return next(err);
      // Merge body and file-derived imageUrl
      const mergedBody = { ...req.body };
      if (req.file) {
        if (req.file.path.startsWith('http')) {
          // Cloudinary URL
          mergedBody.imageUrl = req.file.path;
        } else {
          // Local file path - convert to URL path
          mergedBody.imageUrl = `/uploads/${path.basename(req.file.path)}`;
        }
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
    const { type, title, description, price, category, stockQuantity, imageUrl } = req.body;
    const product = await Product.create({
      type,
      title,
      description,
      price: Number(price),
      category,
      imageUrl,
      stockQuantity: type === 'original-artwork' ? 1 : Number(stockQuantity || 0),
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (admin only) - supports multipart/form-data with `image` file field
router.put('/:id', authMiddleware, adminMiddleware, parser.single('image'), (req, res, next) => {
  const mergedBody = { ...req.body };
  if (req.file && req.file.path) mergedBody.imageUrl = req.file.path;
  const { error } = productUpdateSchema.validate(mergedBody, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
  req.body = mergedBody;
  next();
}, async (req, res, next) => {
  try {
    const updates = { ...req.body };
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

// PUT /api/products/:id (admin only) - supports multipart/form-data with `image` file field
router.put('/:id', authMiddleware, adminMiddleware, parser.single('image'), async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file && req.file.path) updates.imageUrl = req.file.path;
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

// DELETE /api/products/:id (admin only) - soft delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;

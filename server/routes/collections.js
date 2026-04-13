import express from 'express';
import SavedCollection from '../models/SavedCollection.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { collectionSchema, collectionItemSchema } from '../validation/schemas.js';

const router = express.Router();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureDefaultCollection(userId) {
  let collection = await SavedCollection.findOne({ user: userId, isDefault: true }).populate('items');
  if (!collection) {
    collection = await SavedCollection.create({
      user: userId,
      name: 'Wishlist',
      slug: 'wishlist',
      isDefault: true,
      items: [],
    });
    collection = await SavedCollection.findById(collection._id).populate('items');
  }
  return collection;
}

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await ensureDefaultCollection(req.user._id);
    const collections = await SavedCollection.find({ user: req.user._id })
      .populate('items')
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, validate(collectionSchema), async (req, res, next) => {
  try {
    const collection = await SavedCollection.create({
      user: req.user._id,
      name: req.body.name,
      slug: slugify(req.body.name),
      isDefault: false,
      items: [],
    });
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
});

router.post('/wishlist/items', authMiddleware, validate(collectionItemSchema), async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const wishlist = await ensureDefaultCollection(req.user._id);
    const hasItem = wishlist.items.some((item) => item._id.toString() === req.body.productId);

    const updated = await SavedCollection.findByIdAndUpdate(
      wishlist._id,
      hasItem
        ? { $pull: { items: req.body.productId } }
        : { $addToSet: { items: req.body.productId } },
      { new: true }
    ).populate('items');

    res.json({ collection: updated, saved: !hasItem });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/items', authMiddleware, validate(collectionItemSchema), async (req, res, next) => {
  try {
    const collection = await SavedCollection.findOne({ _id: req.params.id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    collection.items = Array.from(new Set([...collection.items.map((item) => item.toString()), req.body.productId]));
    await collection.save();
    await collection.populate('items');
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/items/:productId', authMiddleware, async (req, res, next) => {
  try {
    const collection = await SavedCollection.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $pull: { items: req.params.productId } },
      { new: true }
    ).populate('items');

    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const collection = await SavedCollection.findOne({ _id: req.params.id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    if (collection.isDefault) return res.status(400).json({ message: 'Wishlist cannot be deleted' });

    await SavedCollection.findByIdAndDelete(collection._id);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

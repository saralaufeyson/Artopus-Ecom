import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../models/Product.js';

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('Product enforces type-specific stock (original-artwork max 1)', async () => {
  const p = await Product.create({ type: 'original-artwork', title: 'Unique', description: 'd', price: 10, category: 'Painting', imageUrl: 'http://x.jpg', stockQuantity: 5 });
  expect(p.stockQuantity).toBeLessThanOrEqual(1);
});

test('Product requires imageUrl', async () => {
  let err;
  try {
    await Product.create({ type: 'merchandise', title: 'X', description: 'Y', price: 1, category: 'Misc' });
  } catch (e) { err = e; }
  expect(err).toBeDefined();
  expect(err.message).toMatch(/imageUrl/);
});
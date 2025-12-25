import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoosePkg from 'mongoose';
import Order from '../models/Order.js';

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('Order requires items and shipping address', async () => {
  let err;
  try {
    await Order.create({
      customer: new mongoosePkg.Types.ObjectId(),
      items: [],
      totalAmount: 0,
      paymentIntentId: 'pi_1',
      shippingAddress: {
        street: 'A', city: 'B', state: 'C', zip: '1', country: 'X',
      },
    });
  } catch (e) { err = e; }
  expect(err).toBeDefined();
  expect(err.message).toMatch(/Order must have at least one item/);
});

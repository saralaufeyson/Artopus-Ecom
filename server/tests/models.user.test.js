import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('User has default role customer and email is unique', async () => {
  const u = await User.create({ name: 'A', email: 'a@test.com', password: 'p' });
  expect(u.role).toBe('customer');
  let err;
  try { await User.create({ name: 'B', email: 'a@test.com', password: 'p2' }); } catch (e) { err = e; }
  expect(err).toBeDefined();
});

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

let mongoServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri; // ensure code uses this in tests
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

export async function createAdminAndGetToken() {
  const email = 'admin@test.com';
  const password = 'password123';
  const bcrypt = await import('bcryptjs');
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin',
    });
  }
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

export default app;

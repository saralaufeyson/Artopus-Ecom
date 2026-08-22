import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from .env');
    process.exit(1);
  }

  await connectDB(uri);

  const email = 'sasirekhacreations@gmail.com';
  const password = '12345678';
  const name = 'Sasirekha Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists! Updating role to admin and password to new one...');
    const hash = await bcrypt.hash(password, 10);
    existing.role = 'admin';
    existing.password = hash;
    existing.isVerified = true;
    await existing.save();
    console.log('User successfully updated to admin role.');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    email,
    password: hash,
    role: 'admin',
    isVerified: true
  });

  console.log('Admin user successfully created:', admin.email);
  process.exit(0);
}

run().catch(err => {
  console.error('Error creating admin user:', err);
  process.exit(1);
});

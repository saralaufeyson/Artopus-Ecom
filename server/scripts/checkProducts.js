import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function checkProducts() {
  await connectDB(process.env.MONGO_URI);
  const count = await Product.countDocuments();
  console.log('Product count:', count);
  if (count > 0) {
    const products = await Product.find().limit(5);
    console.log('Sample products:', JSON.stringify(products, null, 2));
  }
  process.exit(0);
}

checkProducts().catch(err => {
  console.error(err);
  process.exit(1);
});

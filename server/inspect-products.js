import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import { connectDB } from './config/db.js';

dotenv.config();

async function run() {
  await connectDB(process.env.MONGO_URI);
  const products = await Product.find({}, 'title imageUrl featured');
  console.log(products.map(p => ({ title: p.title, imageUrl: p.imageUrl, featured: p.featured })));
  process.exit(0);
}

run();

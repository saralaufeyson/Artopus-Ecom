import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error('MONGO_URI not provided');
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
}

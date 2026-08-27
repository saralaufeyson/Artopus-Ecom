import mongoose from 'mongoose';

let connectionPromise;

export async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error('MONGO_URI not provided');

  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri)
      .then(() => {
        console.log('MongoDB connected');
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
}

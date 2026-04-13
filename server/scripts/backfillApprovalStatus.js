import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function run() {
  await connectDB(process.env.MONGO_URI);

  const result = await Product.updateMany(
    {
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ],
    },
    {
      $set: { approvalStatus: 'approved' },
    }
  );

  console.log(`Backfilled approvalStatus for ${result.modifiedCount} product(s).`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

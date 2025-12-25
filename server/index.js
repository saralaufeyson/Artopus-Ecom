import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import app from './app.js';
import { validateEnv } from './config/validateEnv.js';

dotenv.config();

// Ensure required env vars
try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// Connect DB
connectDB(process.env.MONGO_URI).catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

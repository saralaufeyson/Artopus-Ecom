import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import app from './app.js';
import { validateEnv } from './config/validateEnv.js';

dotenv.config();

// Ensure required env vars
try {
  validateEnv();
} catch (err) {
  // use logger to report missing env
  // require lazily to avoid circular import during tests
  const logger = (await import('./utils/logger.js')).default;
  logger.error(err.message);
  process.exit(1);
}

// Connect DB
connectDB(process.env.MONGO_URI).catch(err => {
  const logger = (await import('./utils/logger.js')).default;
  logger.error('Failed to connect to DB', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const logger = (await import('./utils/logger.js')).default;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

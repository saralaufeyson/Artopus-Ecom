import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";
import { emailService } from "./utils/emailService.js";
import logger from "./utils/logger.js";

dotenv.config();

/**
 * Validate environment variables
 */
try {
  validateEnv();
} catch (err) {
  logger.error(err.message);
  process.exit(1);
}

emailService.verifyConnection()
  .then(() => logger.info('Mail server connected'))
  .catch((err) => logger.error(`Mail server connection failed: ${err.code || 'UNKNOWN'}${err.responseCode ? ` (${err.responseCode})` : ''} - ${err.message}`));

/**
 * Connect to MongoDB
 */
connectDB(process.env.MONGO_URI).catch((err) => {
  logger.error("Failed to connect to DB", err);
  process.exit(1);
});

/**
 * Start server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

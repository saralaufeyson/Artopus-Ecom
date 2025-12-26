import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";
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

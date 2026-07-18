import express from "express";
import cors from "cors";
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import paymentsRoutes from './routes/payments.js';
import ordersRoutes from './routes/orders.js';
import uploadsRoutes from './routes/uploads.js';
import metricsRoutes from './routes/metrics.js';
import adminRoutes from './routes/admin.js';
import artistsRoutes from './routes/artists.js';
import artistRequestsRoutes from './routes/artistRequests.js';
import artistPortalRoutes from './routes/artistPortal.js';
import reviewRoutes from './routes/reviews.js';
import pageViewsRoutes from './routes/pageViews.js';
import collectionsRoutes from './routes/collections.js';
import taxRoutes from './routes/taxes.js';
import returnsRoutes from './routes/returns.js';
import couponRoutes from './routes/coupons.js';
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(helmet());

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://test-frontend-wzvi.onrender.com',
  ...(process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

const corsOptions = {
  origin(origin, callback) {
    // For local development the browser origin can be localhost or 127.0.0.1.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
// Stripe webhook needs raw body on that route only
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/artist-requests', artistRequestsRoutes);
app.use('/api/artist-portal', artistPortalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/page-views', pageViewsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Backend running 🚀' }));

if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../client/dist');
  const clientIndexPath = path.join(clientDistPath, 'index.html');

  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api/') && req.accepts('html')) {
        res.sendFile(clientIndexPath);
        return;
      }

      next();
    });
  }
}

app.get('/', (req, res) => {
  res.json({
    status: 'Artopus API running',
    health: '/api/health',
    frontend: process.env.CLIENT_URL || null,
  });
});

// Error handler
app.use(errorHandler);

export default app;

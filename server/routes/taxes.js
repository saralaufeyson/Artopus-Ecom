import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { getAllTaxRates, updateTaxRates, setTaxEnabled } from '../utils/tax.js';

const router = express.Router();

// GET all tax rates (public)
router.get('/rates', async (req, res, next) => {
  try {
    const rates = await getAllTaxRates();
    res.json(rates);
  } catch (err) {
    next(err);
  }
});

// PUT update tax rates (admin only)
router.put('/rates', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates)) {
      return res.status(400).json({ message: 'Rates must be an array' });
    }

    // Validate rates
    for (const rate of rates) {
      if (!rate.state || rate.rate === undefined) {
        return res.status(400).json({ message: 'Each rate must have state and rate' });
      }
      if (rate.rate < 0 || rate.rate > 100) {
        return res.status(400).json({ message: 'Tax rate must be between 0 and 100' });
      }
    }

    const updated = await updateTaxRates(rates);
    res.json({
      message: 'Tax rates updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// PUT toggle tax enabled (admin only)
router.put('/enabled', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Enabled must be a boolean' });
    }

    const updated = await setTaxEnabled(enabled);
    res.json({
      message: `Tax ${enabled ? 'enabled' : 'disabled'}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

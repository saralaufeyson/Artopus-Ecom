import express from 'express';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

// POST /api/payments/create-intent
// Body: { items: [{ productId, quantity }], shippingAddress }
import { validate } from '../middleware/validate.js';
import { createIntentSchema } from '../validation/schemas.js';

const router = express.Router();
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// In test environment use a lightweight stub to avoid calling external Stripe API
if (process.env.NODE_ENV === 'test') {
  let _piCounter = 0;
  stripe = {
    paymentIntents: {
      create: async () => {
        _piCounter += 1;
        return { id: `pi_test_${_piCounter}_${Date.now()}`, client_secret: `cs_test_${_piCounter}` };
      },
    },
    webhooks: {
      constructEvent: (body) => JSON.parse(body),
    },
  };
}

// Helper - allow tests to set a custom stripe object for signature/idempotency testing
export function setStripeForTests(obj) {
  stripe = obj;
}

router.post('/create-intent', authMiddleware, validate(createIntentSchema), async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    // Fetch products and compute total server-side
    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const p = productMap.get(it.productId);
      if (!p) return res.status(400).json({ message: `Product ${it.productId} not available` });
      if (p.type === 'original-artwork' && p.stockQuantity < 1) return res.status(400).json({ message: `${p.title} is sold out` });
      if (p.type === 'merchandise' && p.stockQuantity < it.quantity) return res.status(400).json({ message: `Insufficient stock for ${p.title}` });
      total += p.price * it.quantity;
      orderItems.push({
        productId: p._id, title: p.title, price: p.price, quantity: it.quantity,
      });
    }

    // Create Stripe PaymentIntent (preview/test mode)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    });

    // Create initial order record
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount: total,
      paymentIntentId: paymentIntent.id,
      shippingAddress,
      status: 'created',
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook endpoint
// NOTE: you must configure the raw body parsing on this route in index.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    // Find order by paymentIntentId
    if (process.env.NODE_ENV === 'test') {
      // In tests (in-memory Mongo) transactions are not supported; run without session
      try {
        const order = await Order.findOne({ paymentIntentId: pi.id });
        if (!order) return res.status(404).json({ received: true });
        // Idempotency: if already succeeded, do nothing
        if (order.status === 'succeeded') return res.json({ received: true });
        // Check stock availability before marking succeeded
        for (const it of order.items) {
          const p = await Product.findById(it.productId);
          if (!p) continue;
          if (p.stockQuantity < it.quantity) {
            order.status = 'failed';
            await order.save();
            return res.json({ received: true, note: 'insufficient_stock' });
          }
        }
        order.status = 'succeeded';
        await order.save();
        // Attempt atomic decrements to avoid race conditions
        for (const it of order.items) {
          const updatedP = await Product.findOneAndUpdate(
            { _id: it.productId, stockQuantity: { $gte: it.quantity } },
            { $inc: { stockQuantity: -it.quantity } },
            { new: true },
          );
          if (!updatedP) {
            // insufficient stock during decrement - mark failed
            order.status = 'failed';
            await order.save();
            return res.json({ received: true, note: 'insufficient_stock' });
          }
          if (updatedP.type === 'original-artwork' && updatedP.stockQuantity === 0) {
            updatedP.isActive = false;
            await updatedP.save();
          }
        }
        return res.json({ received: true });
      } catch (err) {
        console.error('Webhook processing error', err);
        return res.status(500).json({ received: false });
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findOne({ paymentIntentId: pi.id }).session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ received: true });
      }
      // Idempotency: if already succeeded, do nothing
      if (order.status === 'succeeded') {
        await session.commitTransaction();
        session.endSession();
        return res.json({ received: true });
      }
      // Attempt atomic decrements within transaction to avoid races
      for (const it of order.items) {
        const updatedP = await Product.findOneAndUpdate(
          { _id: it.productId, stockQuantity: { $gte: it.quantity } },
          { $inc: { stockQuantity: -it.quantity } },
          { session, new: true },
        );
        if (!updatedP) {
          // insufficient stock during decrement - mark failed
          order.status = 'failed';
          await order.save({ session });
          await session.commitTransaction();
          session.endSession();
          return res.json({ received: true, note: 'insufficient_stock' });
        }
        if (updatedP.type === 'original-artwork' && updatedP.stockQuantity === 0) {
          updatedP.isActive = false;
          await updatedP.save({ session });
        }
      }
      order.status = 'succeeded';
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.json({ received: true });
    } catch (err) {
      console.error('Webhook processing error', err);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ received: false });
    }
  }

  res.json({ received: true });
});

export default router;

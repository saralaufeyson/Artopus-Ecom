import express from 'express';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Artist from '../models/Artist.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Wallet from '../models/Wallet.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createIntentSchema } from '../validation/schemas.js';
import { sendArtistOrderNotification } from '../utils/email.js';
import {
  createPhonePePaymentUrl,
  extractPhonePeRedirectUrl,
  fetchPhonePeOrderStatus,
  isPhonePeConfigured,
  mapPhonePeStateToOrderStatus,
  extractPhonePeState,
} from '../utils/phonepe.js';

const router = express.Router();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// In test environment use a lightweight stub to avoid calling external Stripe API.
if (process.env.NODE_ENV === 'test') {
  let piCounter = 0;
  stripe = {
    paymentIntents: {
      create: async () => {
        piCounter += 1;
        return { id: `pi_test_${piCounter}_${Date.now()}`, client_secret: `cs_test_${piCounter}` };
      },
    },
    webhooks: {
      constructEvent: (body) => JSON.parse(body),
    },
  };
}

export function setStripeForTests(obj) {
  stripe = obj;
}

function buildExpectedDeliveryDate() {
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);
  return expectedDeliveryDate;
}

function resolveBuyerOption(product, buyerOption = 'painting') {
  if (buyerOption === 'outline-sketch') {
    return {
      label: 'Outline Sketch',
      unitPrice: Number(product.outlineSketchPrice || product.price),
    };
  }

  if (buyerOption === 'colored-version') {
    return {
      label: 'Colored Version',
      unitPrice: Number(product.coloringPrice || product.price),
    };
  }

  return {
    label: 'Original Painting',
    unitPrice: Number(product.price),
  };
}

async function sendArtistNotifications(order) {
  for (const item of order.items) {
    if (item.artistEmail) {
      sendArtistOrderNotification(item.artistEmail, {
        orderId: order._id,
        itemTitle: item.title,
        quantity: item.quantity,
        price: item.price,
      }).catch((error) => console.error('Silent fail on artist email:', error));
    }
  }
}

async function addFundsToArtistWallet(artistUserId, totalPrice, session = null) {
  const platformFee = 0.18;
  const netAmount = Number((totalPrice * (1 - platformFee)).toFixed(2));

  let wallet = await Wallet.findOne({ userId: artistUserId }).session(session);

  if (!wallet) {
    [wallet] = await Wallet.create([{ userId: artistUserId, balance: 0 }], { session });
  }

  wallet.balance = Number((wallet.balance + netAmount).toFixed(2));
  await wallet.save({ session });

  return wallet;
}

async function creditArtistWallets(order, session = null) {
  for (const item of order.items) {
    if (!item.artistId) continue;

    const artist = await Artist.findById(item.artistId).session(session);
    if (!artist) continue;

    const grossAmount = item.price * item.quantity;
    const commissionAmount = Number(((grossAmount * artist.commissionRate) / 100).toFixed(2));
    const netAmount = Number((grossAmount - commissionAmount).toFixed(2));

    const existingCredit = await WalletTransaction.findOne({
      artist: artist._id,
      order: order._id,
      type: 'sale_credit',
      'metadata.productId': item.productId.toString(),
      'metadata.buyerOption': item.buyerOption,
    }).session(session);

    if (existingCredit) continue;

    artist.walletBalance = Number((artist.walletBalance + netAmount).toFixed(2));
    artist.lifetimeEarnings = Number((artist.lifetimeEarnings + netAmount).toFixed(2));
    await artist.save({ session });

    if (artist.userId) {
      await addFundsToArtistWallet(artist.userId, grossAmount, session);
    }

    await WalletTransaction.create([{
      artist: artist._id,
      order: order._id,
      amount: netAmount,
      commissionAmount,
      type: 'sale_credit',
      status: 'completed',
      note: `Sale credit for ${item.title}`,
      metadata: {
        productId: item.productId,
        buyerOption: item.buyerOption,
        grossAmount,
      },
    }], session ? { session } : undefined);
  }
}

async function fulfillOrderWithoutTransaction(order) {
  if (!order || order.status === 'succeeded') return order;

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stockQuantity < item.quantity) {
      order.status = 'failed';
      await order.save();
      return order;
    }
  }

  order.status = 'succeeded';
  order.statusHistory.push({ status: 'succeeded', note: 'Payment confirmed' });
  await order.save();

  for (const item of order.items) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.productId, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      order.status = 'failed';
      await order.save();
      return order;
    }

    if (updatedProduct.type === 'original-artwork' && updatedProduct.stockQuantity === 0) {
      updatedProduct.isActive = false;
      await updatedProduct.save();
    }
  }

  await sendArtistNotifications(order);
  await creditArtistWallets(order);
  return order;
}

async function fulfillOrderWithTransaction(order) {
  if (!order || order.status === 'succeeded') return order;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderInSession = await Order.findById(order._id).session(session);
    if (!orderInSession) {
      await session.abortTransaction();
      session.endSession();
      return null;
    }

    if (orderInSession.status === 'succeeded') {
      await session.commitTransaction();
      session.endSession();
      return orderInSession;
    }

    for (const item of orderInSession.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { session, new: true }
      );

      if (!updatedProduct) {
        orderInSession.status = 'failed';
        await orderInSession.save({ session });
        await session.commitTransaction();
        session.endSession();
        return orderInSession;
      }

      if (updatedProduct.type === 'original-artwork' && updatedProduct.stockQuantity === 0) {
        updatedProduct.isActive = false;
        await updatedProduct.save({ session });
      }
    }

    orderInSession.status = 'succeeded';
    orderInSession.statusHistory.push({ status: 'succeeded', note: 'Payment confirmed' });
    await orderInSession.save({ session });
    await creditArtistWallets(orderInSession, session);
    await session.commitTransaction();
    session.endSession();

    await sendArtistNotifications(orderInSession);
    return orderInSession;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function fulfillOrder(order) {
  if (process.env.NODE_ENV === 'test') {
    return fulfillOrderWithoutTransaction(order);
  }

  return fulfillOrderWithTransaction(order);
}

async function buildCheckoutContext(items) {
  const ids = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: `Product ${item.productId} not available` };
    }

    if (product.type === 'original-artwork' && product.stockQuantity < 1) {
      return { error: `${product.title} is sold out` };
    }

    if (product.type === 'merchandise' && product.stockQuantity < item.quantity) {
      return { error: `Insufficient stock for ${product.title}` };
    }

    const buyerOption = resolveBuyerOption(product, item.buyerOption);
    total += buyerOption.unitPrice * item.quantity;
    orderItems.push({
      productId: product._id,
      title: product.title,
      price: buyerOption.unitPrice,
      quantity: item.quantity,
      artistEmail: product.artistEmail,
      artistId: product.artistId,
      buyerOption: item.buyerOption || 'painting',
      buyerOptionLabel: buyerOption.label,
    });
  }

  return { total, orderItems };
}

router.post('/create-intent', authMiddleware, validate(createIntentSchema), async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    const checkoutContext = await buildCheckoutContext(items);
    if (checkoutContext.error) {
      return res.status(400).json({ message: checkoutContext.error });
    }

    const { total, orderItems } = checkoutContext;
    const expectedDeliveryDate = buildExpectedDeliveryDate();

    if (isPhonePeConfigured() && process.env.NODE_ENV !== 'test') {
      const merchantOrderId = `phonepe_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const order = await Order.create({
        customer: req.user._id,
        items: orderItems,
        totalAmount: total,
        paymentIntentId: merchantOrderId,
        paymentProvider: 'phonepe',
        shippingAddress,
        status: 'created',
        expectedDeliveryDate,
      });

      try {
        const redirectBase = process.env.PHONEPE_REDIRECT_BASE_URL || process.env.CLIENT_URL || 'http://localhost:5173';
        const redirectUrl = `${redirectBase}/order-success/${order._id}?gateway=phonepe`;
        const phonePePayload = {
          merchantOrderId,
          amount: Math.round(total * 100),
          expireAfter: 1200,
          metaInfo: {
            udf1: req.user._id.toString(),
            udf2: order._id.toString(),
          },
          paymentFlow: {
            type: 'PG_CHECKOUT',
            message: `Artopus order ${order._id}`,
            merchantUrls: {
              redirectUrl,
            },
          },
        };

        const providerResponse = await createPhonePePaymentUrl(phonePePayload);
        const paymentUrl = extractPhonePeRedirectUrl(providerResponse);

        if (!paymentUrl) {
          await Order.findByIdAndDelete(order._id);
          return res.status(502).json({ message: 'PhonePe did not return a checkout URL' });
        }

        return res.json({
          provider: 'phonepe',
          redirectUrl: paymentUrl,
          orderId: order._id,
        });
      } catch (error) {
        await Order.findByIdAndDelete(order._id);
        throw error;
      }
    }

    let paymentIntentId = `mock_pi_${Date.now()}`;
    let clientSecret = `mock_secret_${Date.now()}`;
    let paymentProvider = 'mock';

    if (stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'usd',
          metadata: { integration_check: 'accept_a_payment' },
        });
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
        paymentProvider = 'stripe';
      } catch (error) {
        console.error('Stripe error, falling back to mock mode:', error.message);
      }
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount: total,
      paymentIntentId,
      paymentProvider,
      shippingAddress,
      status: 'created',
      expectedDeliveryDate,
    });

    return res.json({ clientSecret, orderId: order._id, provider: paymentProvider });
  } catch (error) {
    return next(error);
  }
});

router.get('/phonepe/status/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.orderId }
      : { _id: req.params.orderId, customer: req.user._id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentProvider !== 'phonepe') {
      return res.json({ order, providerState: order.status });
    }

    const providerPayload = await fetchPhonePeOrderStatus(order.paymentIntentId);
    const providerState = extractPhonePeState(providerPayload);
    const mappedStatus = mapPhonePeStateToOrderStatus(providerPayload);

    let updatedOrder = order;
    if (mappedStatus === 'succeeded') {
      updatedOrder = await fulfillOrder(order);
    } else if (mappedStatus === 'failed' && order.status === 'created') {
      order.status = 'failed';
      updatedOrder = await order.save();
    }

    return res.json({
      order: updatedOrder,
      providerState,
      providerStatus: mappedStatus,
    });
  } catch (error) {
    return next(error);
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature error', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      if (!order) {
        return res.status(404).json({ received: true });
      }

      const updatedOrder = await fulfillOrder(order);
      if (updatedOrder && updatedOrder.status === 'failed') {
        return res.json({ received: true, note: 'insufficient_stock' });
      }

      return res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error', error);
      return res.status(500).json({ received: false });
    }
  }

  return res.json({ received: true });
});

export default router;

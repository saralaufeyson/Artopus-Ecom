import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { test, expect, type Page } from '@playwright/test';
import User from '../server/models/User.js';
import Artist from '../server/models/Artist.js';
import Product from '../server/models/Product.js';
import Order from '../server/models/Order.js';
import Wallet from '../server/models/Wallet.js';
import WalletTransaction from '../server/models/WalletTransaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const PASSWORD = 'password123';

const selectors = {
  email: '#email',
  password: '#password',
  submitLogin: 'button[type="submit"]',
  originalOption: 'button:has-text("Original Painting")',
  addToCart: 'button:has-text("Add to Cart")',
  cartCheckout: 'a:has-text("Proceed to Secure Checkout")',
  street: 'input[placeholder="Street Address"]',
  city: 'input[placeholder="City"]',
  state: 'input[placeholder="State"]',
  zip: 'input[placeholder="ZIP Code"]',
  country: 'input[placeholder="Country"]',
  continueToPhonePe: 'button:has-text("Continue to PhonePe")',
};

type SeededData = {
  customer: { email: string };
  artistUser: { email: string };
  artist: { _id: string; artistName: string };
  product: { _id: string; price: number };
};

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required to run this spec');
  await mongoose.connect(process.env.MONGO_URI);
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${FRONTEND_URL}/login`);
  await page.locator(selectors.email).fill(email);
  await page.locator(selectors.password).fill(password);
  await page.locator(selectors.submitLogin).click();
}

async function seedGoldenPathData(): Promise<SeededData> {
  const suffix = Date.now().toString();
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const customer = await User.create({
    name: `Golden Buyer ${suffix}`,
    email: `golden-buyer-${suffix}@test.com`,
    password: hashedPassword,
    role: 'customer',
  });

  const artistUser = await User.create({
    name: `Golden Artist ${suffix}`,
    email: `golden-artist-${suffix}@test.com`,
    password: hashedPassword,
    role: 'artist',
  });

  const artist = await Artist.create({
    artistName: `Golden Artist ${suffix}`,
    email: artistUser.email,
    userId: artistUser._id,
    walletBalance: 0,
    lifetimeEarnings: 0,
    totalWithdrawn: 0,
    isActive: true,
  });

  await Wallet.create({
    artist: artist._id,
    balance: 0,
    lifetimeCredits: 0,
  });

  const product = await Product.create({
    type: 'original-artwork',
    title: `Golden Path Original ${suffix}`,
    description: 'Original painting used for the main flow Playwright test.',
    price: 200,
    category: 'Painting',
    imageUrl: 'https://example.com/golden-path-original.jpg',
    stockQuantity: 1,
    artistId: artist._id,
    artistUserId: artistUser._id,
    artistName: artist.artistName,
    artistEmail: artist.email,
    medium: 'Oil on canvas',
    dimensions: '24 x 36 in',
    approvalStatus: 'approved',
    isActive: true,
  });

  return {
    customer: { email: customer.email },
    artistUser: { email: artistUser.email },
    artist: { _id: String(artist._id), artistName: artist.artistName },
    product: { _id: String(product._id), price: product.price },
  };
}

async function simulateSuccessfulPhonePePayment(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  if (order.status === 'succeeded') {
    return order.toObject();
  }

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);

    if ((product.stockQuantity ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    product.stockQuantity -= item.quantity;
    if (product.type === 'original-artwork' && product.stockQuantity === 0) {
      product.isActive = false;
    }
    await product.save();

    if (!item.artistId) continue;

    const saleCreditExists = await WalletTransaction.findOne({
      artist: item.artistId,
      order: order._id,
      type: 'sale_credit',
      'metadata.productId': item.productId,
      'metadata.buyerOption': item.buyerOption,
    });

    if (saleCreditExists) continue;

    const grossAmount = Number((item.price * item.quantity).toFixed(2));
    const commissionAmount = Number((grossAmount * 0.18).toFixed(2));
    const artistShare = Number((grossAmount * 0.82).toFixed(2));

    await Artist.updateOne(
      { _id: item.artistId },
      { $inc: { walletBalance: artistShare, lifetimeEarnings: artistShare } }
    );

    await Wallet.updateOne(
      { artist: item.artistId },
      { $inc: { balance: artistShare, lifetimeCredits: artistShare } },
      { upsert: true }
    );

    await WalletTransaction.create({
      artist: item.artistId,
      order: order._id,
      amount: artistShare,
      commissionAmount,
      type: 'sale_credit',
      status: 'completed',
      note: `Sale credit for ${item.title}`,
      metadata: {
        productId: item.productId,
        buyerOption: item.buyerOption,
        grossAmount,
      },
    });
  }

  order.status = 'succeeded';
  order.statusHistory.push({ status: 'succeeded', note: 'PhonePe payment simulated in Playwright test' });
  await order.save();

  const updatedOrder = await Order.findById(orderId).lean();
  if (!updatedOrder) throw new Error(`Updated order ${orderId} not found`);
  return updatedOrder;
}

test.beforeAll(async () => {
  await ensureDbConnection();
});

test.afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('Golden Path: login, buy original, simulate PhonePe success, verify stock and artist wallet', async ({ page, browser }) => {
  const seeded = await seedGoldenPathData();
  const expectedArtistShare = Number((seeded.product.price * 0.82).toFixed(2));
  let createdOrderId = '';

  await page.route('**/api/payments/create-intent', async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    createdOrderId = payload.orderId;

    await route.fulfill({
      response,
      json: {
        ...payload,
        clientSecret: null,
        redirectUrl: `${FRONTEND_URL}/order-success/${payload.orderId}?gateway=phonepe`,
      },
    });
  });

  await page.route('**/api/payments/phonepe/status/*', async (route) => {
    const orderId = route.request().url().split('/').pop()?.split('?')[0] || createdOrderId;
    const order = await simulateSuccessfulPhonePePayment(orderId);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        order,
        providerState: 'COMPLETED',
        providerStatus: 'succeeded',
      }),
    });
  });

  await login(page, seeded.customer.email, PASSWORD);
  await page.goto(`${FRONTEND_URL}/product/${seeded.product._id}`);
  await page.locator(selectors.originalOption).click();
  await page.locator(selectors.addToCart).click();

  await page.goto(`${FRONTEND_URL}/cart`);
  await page.locator(selectors.cartCheckout).click();

  await page.locator(selectors.street).fill('123 Golden Street');
  await page.locator(selectors.city).fill('Hyderabad');
  await page.locator(selectors.state).fill('Telangana');
  await page.locator(selectors.zip).fill('500001');
  await page.locator(selectors.country).fill('India');

  const createIntentResponse = page.waitForResponse((response) =>
    response.url().includes('/api/payments/create-intent') && response.request().method() === 'POST'
  );

  await page.locator(selectors.continueToPhonePe).click();
  await createIntentResponse;

  await page.waitForURL(`**/order-success/${createdOrderId}?gateway=phonepe`);
  await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible();

  const updatedProduct = await Product.findById(seeded.product._id).lean();
  expect(updatedProduct?.stockQuantity).toBe(0);
  expect(updatedProduct?.isActive).toBe(false);

  const updatedWallet = await Wallet.findOne({ artist: seeded.artist._id }).lean();
  expect(updatedWallet?.balance).toBe(expectedArtistShare);

  const artistContext = await browser.newContext();
  const artistPage = await artistContext.newPage();

  await login(artistPage, seeded.artistUser.email, PASSWORD);
  await artistPage.goto(`${FRONTEND_URL}/artist-dashboard`);

  await expect(artistPage.getByRole('heading', { name: seeded.artist.artistName })).toBeVisible();

  const totalEarningsCard = artistPage.locator('div.rounded-3xl').filter({ hasText: 'Total Earnings' });
  await expect(totalEarningsCard.getByText(`$${expectedArtistShare.toFixed(2)}`)).toBeVisible();

  await artistContext.close();
});

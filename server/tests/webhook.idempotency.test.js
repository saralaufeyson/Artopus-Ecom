import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { setStripeForTests } from '../routes/payments.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Webhook idempotency: repeated events do not double-process order', async () => {
  // Set a stripe stub that returns parseable events
  setStripeForTests({ paymentIntents: { create: async () => ({ id: `pi_test_${Date.now()}`, client_secret: `cs_test` }) }, webhooks: { constructEvent: (body) => JSON.parse(body) } });

  const { createAdminAndGetToken } = await import('./setup.js');
  const adminToken = await createAdminAndGetToken();
  const p = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ type: 'merchandise', title: 'Idem', description: 'x', price: 1, category: 'Test', stockQuantity: 2, imageUrl: 'http://x.jpg' });
  expect(p.status).toBe(201);
  const prod = p.body;

  // Create buyer and intent
  const uniqueEmail = `idembuyer+${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({ name: 'Buyer', email: uniqueEmail, password: 'password123' });
  const token = reg.body.token;
  const ci = await request(app).post('/api/payments/create-intent').set('Authorization', `Bearer ${token}`).send({ items: [{ productId: prod._id, quantity: 1 }], shippingAddress: { street: 'A', city: 'B', state: 'C', zip: '1', country: 'X' } });
  expect(ci.status).toBe(200);
  const orderId = ci.body.orderId;
  const paymentIntentId = (await Order.findById(orderId)).paymentIntentId;

  // Send webhook twice
  const event = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: paymentIntentId } } });
  const r1 = await request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').send(event);
  expect(r1.status).toBe(200);
  const r2 = await request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').send(event);
  expect(r2.status).toBe(200);

  const updated = await Product.findById(prod._id);
  expect(updated.stockQuantity).toBe(1); // only decremented once
});
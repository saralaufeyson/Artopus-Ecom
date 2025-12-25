import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { setStripeForTests } from '../routes/payments.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Concurrent checkouts do not oversell stock', async () => {
  setStripeForTests({
    paymentIntents: { create: async () => ({ id: `pi_test_${Date.now()}`, client_secret: 'cs_test' }) },
    webhooks: { constructEvent: (body) => JSON.parse(body) },
  });

  const { createAdminAndGetToken } = await import('./setup.js');
  const adminToken = await createAdminAndGetToken();

  const p = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({
    type: 'merchandise', title: 'Concurrent', description: 'x', price: 1, category: 'Test', stockQuantity: 1, imageUrl: 'http://x.jpg',
  });
  expect(p.status).toBe(201);
  const prod = p.body;

  // create two buyers and intents
  const reg1 = await request(app).post('/api/auth/register').send({ name: 'B1', email: `b1+${Date.now()}@test.com`, password: 'password123' });
  const t1 = reg1.body.token;
  const ci1 = await request(app).post('/api/payments/create-intent').set('Authorization', `Bearer ${t1}`).send({
    items: [{ productId: prod._id, quantity: 1 }],
    shippingAddress: {
      street: 'A', city: 'B', state: 'C', zip: '1', country: 'X',
    },
  });
  expect(ci1.status).toBe(200);

  const reg2 = await request(app).post('/api/auth/register').send({ name: 'B2', email: `b2+${Date.now()}@test.com`, password: 'password123' });
  const t2 = reg2.body.token;
  const ci2 = await request(app).post('/api/payments/create-intent').set('Authorization', `Bearer ${t2}`).send({
    items: [{ productId: prod._id, quantity: 1 }],
    shippingAddress: {
      street: 'A', city: 'B', state: 'C', zip: '1', country: 'X',
    },
  });
  expect(ci2.status).toBe(200);

  const order1 = await Order.findById(ci1.body.orderId);
  const order2 = await Order.findById(ci2.body.orderId);

  // send webhooks concurrently
  const event1 = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: order1.paymentIntentId } } });
  const event2 = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: order2.paymentIntentId } } });

  const [r1, r2] = await Promise.all([
    request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').send(event1),
    request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').send(event2),
  ]);

  expect([r1.status, r2.status]).toEqual([200, 200]);

  const updated = await Product.findById(prod._id);
  expect(updated.stockQuantity).toBe(0);
  const o1 = await Order.findById(order1._id);
  const o2 = await Order.findById(order2._id);
  const succeededCount = [o1, o2].filter((o) => o.status === 'succeeded').length;
  const failedCount = [o1, o2].filter((o) => o.status === 'failed').length;
  expect(succeededCount).toBe(1);
  expect(failedCount).toBe(1);
});

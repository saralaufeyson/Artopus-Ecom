import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

async function createCustomer(email = 'buyer@test.com') {
  const res = await request(app).post('/api/auth/register').send({ name: 'Buyer', email, password: 'password123' });
  return res.body.token;
}

test('E2E: merchandise checkout reduces inventory and marks order succeeded via webhook', async () => {
  // Create admin and product
  const adminToken = await (await import('./setup.js')).createAdminAndGetToken();
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ type: 'merchandise', title: 'Sticker Pack', description: 'Nice stickers', price: 5.0, category: 'Sticker', stockQuantity: 5, imageUrl: 'http://example.com/image.jpg' });
  expect(productRes.status).toBe(201);
  const product = productRes.body;

  // Create customer and create payment intent
  const customerToken = await createCustomer('buyer1@test.com');
  const createIntentRes = await request(app)
    .post('/api/payments/create-intent')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ items: [{ productId: product._id, quantity: 2 }], shippingAddress: { street: 'A', city: 'B', state: 'C', zip: '12345', country: 'X' } });
  expect(createIntentRes.status).toBe(200);
  const { clientSecret, orderId } = createIntentRes.body;
  expect(clientSecret).toBeDefined();
  expect(orderId).toBeDefined();

  // Simulate Stripe webhook event for succeeded payment
  const paymentIntentId = (await Order.findById(orderId)).paymentIntentId;
  const event = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: paymentIntentId } } });
  const webhookRes = await request(app)
    .post('/api/payments/webhook')
    .set('stripe-signature', 'testsig')
    .set('Content-Type', 'application/json')
    .send(event);
  expect(webhookRes.status === 200 || webhookRes.status === 201 || webhookRes.status === 204 || webhookRes.status === 200).toBeTruthy();

  // Check order status & product stock
  const updatedOrder = await Order.findById(orderId);
  expect(updatedOrder.status).toBe('succeeded');
  const updatedProduct = await Product.findById(product._id);
  expect(updatedProduct.stockQuantity).toBe(3); // 5 - 2
});

test('E2E: original artwork sale marks as sold out and deactivates product', async () => {
  const adminToken = await (await import('./setup.js')).createAdminAndGetToken();
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ type: 'original-artwork', title: 'Unique Painting', description: 'One of a kind', price: 200.0, category: 'Painting', stockQuantity: 1, imageUrl: 'http://example.com/image2.jpg' });
  expect(productRes.status).toBe(201);
  const product = productRes.body;

  const customerToken = await createCustomer('buyer2@test.com');
  const createIntentRes = await request(app)
    .post('/api/payments/create-intent')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ items: [{ productId: product._id, quantity: 1 }], shippingAddress: { street: 'A', city: 'B', state: 'C', zip: '12345', country: 'X' } });
  expect(createIntentRes.status).toBe(200);
  const { orderId } = createIntentRes.body;

  const paymentIntentId = (await Order.findById(orderId)).paymentIntentId;
  const event = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: paymentIntentId } } });
  await request(app)
    .post('/api/payments/webhook')
    .set('stripe-signature', 'testsig')
    .set('Content-Type', 'application/json')
    .send(event);

  const updatedProduct = await Product.findById(product._id);
  expect(updatedProduct.stockQuantity).toBe(0);
  expect(updatedProduct.isActive).toBe(false);
});

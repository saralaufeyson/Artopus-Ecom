import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('POST /api/payments/create-intent fails when insufficient stock', async () => {
  // Create admin and product with stock 1
  const { createAdminAndGetToken } = await import('./setup.js');
  const adminToken = await createAdminAndGetToken();
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ type: 'merchandise', title: 'Tiny Item', description: 'Small', price: 10.0, category: 'Accessory', stockQuantity: 1, imageUrl: 'http://example.com/img.jpg' });
  expect(productRes.status).toBe(201);
  const product = productRes.body;

  // Create customer and try to buy 2 units
  const reg = await request(app).post('/api/auth/register').send({ name: 'Buyer', email: 'buyer-insuff@test.com', password: 'password123' });
  const token = reg.body.token;

  const res = await request(app)
    .post('/api/payments/create-intent')
    .set('Authorization', `Bearer ${token}`)
    .send({ items: [{ productId: product._id, quantity: 2 }], shippingAddress: { street: 'A', city: 'B', state: 'C', zip: '1', country: 'X' } });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/Insufficient stock|sold out/);
});
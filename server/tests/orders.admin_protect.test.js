import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Non-admin cannot update order status', async () => {
  const { createAdminAndGetToken } = await import('./setup.js');
  const adminToken = await createAdminAndGetToken();

  // Create product
  const prod = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ type: 'merchandise', title: 'Book', description: 'Nice', price: 10, category: 'Book', stockQuantity: 10, imageUrl: 'http://example.com/book.jpg' });
  expect(prod.status).toBe(201);

  // Create buyer + intent
  const reg = await request(app).post('/api/auth/register').send({ name: 'Buyer3', email: 'buyer3@test.com', password: 'password123' });
  const token = reg.body.token;
  const ci = await request(app).post('/api/payments/create-intent').set('Authorization', `Bearer ${token}`).send({ items: [{ productId: prod.body._id, quantity: 1 }], shippingAddress: { street: 'A', city: 'B', state: 'C', zip: '1', country: 'X' } });
  expect(ci.status).toBe(200);

  const orderId = ci.body.orderId;

  // Non-admin tries to update status
  const patch = await request(app).patch(`/api/orders/admin/orders/${orderId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'shipped' });
  expect(patch.status).toBe(403);
});
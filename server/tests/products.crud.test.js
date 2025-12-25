import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Admin can create, update, and deactivate a product', async () => {
  const { createAdminAndGetToken } = await import('./setup.js');
  const token = await createAdminAndGetToken();

  // Create
  const createRes = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({
    type: 'merchandise', title: 'CRUD Test', description: 'desc', price: 4.5, category: 'Test', stockQuantity: 10, imageUrl: 'http://x.jpg',
  });
  expect(createRes.status).toBe(201);
  const prod = createRes.body;

  // Update
  const updateRes = await request(app).put(`/api/products/${prod._id}`).set('Authorization', `Bearer ${token}`).send({ price: 6.0 });
  expect(updateRes.status).toBe(200);
  expect(updateRes.body.price).toBe(6);

  // Delete (soft)
  const delRes = await request(app).delete(`/api/products/${prod._id}`).set('Authorization', `Bearer ${token}`);
  expect(delRes.status).toBe(200);

  // Ensure inactive not returned in list
  const listRes = await request(app).get('/api/products');
  expect(listRes.body.some((p) => p._id === prod._id)).toBe(false);
});

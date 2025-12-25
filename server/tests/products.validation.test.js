import request from 'supertest';
import { setupTestDB, teardownTestDB, createAdminAndGetToken } from './setup.js';
import app from '../app.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => await teardownTestDB());

test('POST /api/products validates required fields', async () => {
  const token = await createAdminAndGetToken();
  // Send JSON body without required fields (type, description, price)
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Product', imageUrl: 'http://example.com/image.jpg' });

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('message', 'Validation error');
});

import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Non-admin cannot create products or get upload signature (403)', async () => {
  // Create normal user
  const reg = await request(app).post('/api/auth/register').send({ name: 'User', email: 'user-noadmin@test.com', password: 'password123' });
  const token = reg.body.token;

  const prodRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'merchandise', title: 'X', description: 'Y', price: 1, category: 'Misc', imageUrl: 'http://example.com' });
  expect(prodRes.status).toBe(403);

  const uploadsRes = await request(app)
    .get('/api/uploads/signature')
    .set('Authorization', `Bearer ${token}`);
  expect(uploadsRes.status).toBe(403);
});
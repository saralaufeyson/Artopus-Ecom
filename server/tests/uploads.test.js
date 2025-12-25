import request from 'supertest';
import { setupTestDB, teardownTestDB, createAdminAndGetToken } from './setup.js';
import app from '../app.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

test('GET /api/uploads/signature returns signature for admin', async () => {
  const token = await createAdminAndGetToken();
  const res = await request(app).get('/api/uploads/signature').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('signature');
  expect(res.body).toHaveProperty('timestamp');
  expect(res.body).toHaveProperty('apiKey');
});

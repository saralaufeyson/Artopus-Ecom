import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('POST /api/payments/webhook returns 400 on invalid payload (invalid JSON)', async () => {
  // Prepare a fake event (not valid JSON) and post
  const res = await request(app)
    .post('/api/payments/webhook')
    .set('Content-Type', 'application/json')
    .send('not-a-json');

  expect(res.status).toBe(400);
  expect(res.text).toMatch(/Webhook Error/i);
});

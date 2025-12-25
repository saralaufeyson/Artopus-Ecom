import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';
import { setStripeForTests } from '../routes/payments.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Webhook signature failure returns 400 with message', async () => {
  // Make constructEvent throw like Stripe would on invalid signature
  setStripeForTests({ webhooks: { constructEvent: () => { throw new Error('Invalid signature'); } } });
  const event = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: 'pi_fake' } } });
  const res = await request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').send(event);
  expect(res.status).toBe(400);
  expect(res.text).toMatch(/Webhook Error/i);
});
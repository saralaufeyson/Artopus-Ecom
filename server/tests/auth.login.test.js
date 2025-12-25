import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Register and login flow issues JWT and does not expose password', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'RegUser', email: 'reguser@test.com', password: 'bigsecret' });
  expect(r.status).toBe(200);
  expect(r.body.token).toBeDefined();
  expect(r.body.user.password).toBeUndefined();

  const l = await request(app).post('/api/auth/login').send({ email: 'reguser@test.com', password: 'bigsecret' });
  expect(l.status).toBe(200);
  expect(l.body.token).toBeDefined();
});

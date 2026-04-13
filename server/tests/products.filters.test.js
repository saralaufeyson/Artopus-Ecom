import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Product filters (type, artistId, and full-text q) work as expected', async () => {
  const { createAdminAndGetToken } = await import('./setup.js');
  const adminToken = await createAdminAndGetToken();
  const artistA = '507f191e810c19729de860ea';
  const artistB = '507f191e810c19729de860eb';

  // Create merchandise sticker
  const a = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ type: 'merchandise', title: 'Sticker A', description: 'Cute sticker', price: 2.5, category: 'Sticker', imageUrl: 'http://example.com/1.jpg', artistId: artistA });
  expect(a.status).toBe(201);

  // Create original artwork
  const b = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ type: 'original-artwork', title: 'Unique Art', description: 'One-of-a-kind', price: 100, category: 'Painting', imageUrl: 'http://example.com/2.jpg', artistId: artistB });
  expect(b.status).toBe(201);

  const resType = await request(app).get('/api/products?type=merchandise');
  expect(resType.status).toBe(200);
  expect(resType.body.some(p => p.title === 'Sticker A')).toBeTruthy();
  expect(resType.body.some(p => p.title === 'Unique Art')).toBeFalsy();

  const resArtist = await request(app).get(`/api/products?artistId=${artistA}`);
  expect(resArtist.status).toBe(200);
  expect(resArtist.body).toHaveLength(1);
  expect(resArtist.body[0].title).toBe('Sticker A');

  const resQ = await request(app).get('/api/products?q=Unique');
  expect(resQ.status).toBe(200);
  expect(resQ.body.some(p => p.title === 'Unique Art')).toBeTruthy();
});

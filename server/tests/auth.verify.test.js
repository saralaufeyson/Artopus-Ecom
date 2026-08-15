import request from 'supertest';
import bcrypt from 'bcryptjs';
import { setupTestDB, teardownTestDB } from './setup.js';
import app from '../app.js';
import User from '../models/User.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

test('Full registration, verification, resend verification, and login flow', async () => {
  // 1. Register a user
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'VerifyUser',
      email: 'verifyuser@test.com',
      password: 'password123',
    });

  expect(regRes.status).toBe(200);
  expect(regRes.body.unverified).toBe(true);
  expect(regRes.body.email).toBe('verifyuser@test.com');

  // Verify they cannot login yet
  const loginFail = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'verifyuser@test.com',
      password: 'password123',
    });
  expect(loginFail.status).toBe(403);
  expect(loginFail.body.unverified).toBe(true);

  // 2. Fetch the user from the database and set a known OTP hash
  const user = await User.findOne({ email: 'verifyuser@test.com' });
  expect(user).toBeDefined();
  expect(user.isVerified).toBe(false);
  expect(user.otpHash).toBeDefined();
  expect(user.otpExpires).toBeDefined();

  const testOtp = '123456';
  const salt = await bcrypt.genSalt(10);
  user.otpHash = await bcrypt.hash(testOtp, salt);
  await user.save();

  // 3. Test verification with wrong OTP
  const verifyWrong = await request(app)
    .post('/api/auth/verify-email')
    .send({
      email: 'verifyuser@test.com',
      otp: '000000',
    });
  expect(verifyWrong.status).toBe(400);

  // Check attempt count incremented
  const userAfterWrong = await User.findOne({ email: 'verifyuser@test.com' });
  expect(userAfterWrong.otpAttempts).toBe(1);

  // 4. Test verification with correct OTP
  const verifyCorrect = await request(app)
    .post('/api/auth/verify-email')
    .send({
      email: 'verifyuser@test.com',
      otp: testOtp,
    });
  expect(verifyCorrect.status).toBe(200);

  // Verify database fields updated
  const userAfterCorrect = await User.findOne({ email: 'verifyuser@test.com' });
  expect(userAfterCorrect.isVerified).toBe(true);
  expect(userAfterCorrect.otpHash).toBeUndefined();

  // 5. Verify they can now login successfully
  const loginSuccess = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'verifyuser@test.com',
      password: 'password123',
    });
  expect(loginSuccess.status).toBe(200);
  expect(loginSuccess.body.token).toBeDefined();
});

test('Resend verification and rate-limiting cooldown', async () => {
  // Register another user
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'ResendUser',
      email: 'resenduser@test.com',
      password: 'password123',
    });

  const user = await User.findOne({ email: 'resenduser@test.com' });
  
  // Cooldown is set to 1 minute, so trying to resend immediately should return 429
  const resendCooldown = await request(app)
    .post('/api/auth/resend-verification')
    .send({ email: 'resenduser@test.com' });
  
  expect(resendCooldown.status).toBe(429);
  expect(resendCooldown.body.message).toContain('Please wait');

  // Manually clear cooldown in DB to allow resend
  user.otpResendCooldown = new Date(Date.now() - 1000);
  await user.save();

  const resendSuccess = await request(app)
    .post('/api/auth/resend-verification')
    .send({ email: 'resenduser@test.com' });

  expect(resendSuccess.status).toBe(200);
  expect(resendSuccess.body.message).toBe('If the email is registered, a new verification code has been sent.');
});

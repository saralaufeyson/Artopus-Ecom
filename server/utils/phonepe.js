import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';

let clientInstance = null;

function getClientInstance() {
  if (!clientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    let clientSecret = process.env.PHONEPE_CLIENT_SECRET || '';
    let saltIndex = 1;

    // Auto-extract salt key and salt index if concatenated as key###index
    if (clientSecret.includes('###')) {
      const parts = clientSecret.split('###');
      clientSecret = parts[0];
      saltIndex = parseInt(parts[1], 10) || 1;
    } else {
      let version = process.env.PHONEPE_CLIENT_VERSION || '1';
      if (version.startsWith('v')) {
        version = version.slice(1);
      }
      saltIndex = parseInt(version, 10) || 1;
    }

    // Use PHONEPE_ENV to determine environment (default to SANDBOX if not explicitly set to PRODUCTION)
    const isProduction = process.env.PHONEPE_ENV === 'PRODUCTION';
    const env = isProduction ? Env.PRODUCTION : Env.SANDBOX;

    clientInstance = StandardCheckoutClient.getInstance(clientId, clientSecret, saltIndex, env);
  }
  return clientInstance;
}

export function isPhonePeConfigured() {
  return Boolean(
    process.env.PHONEPE_CLIENT_ID
    && process.env.PHONEPE_CLIENT_SECRET
    && process.env.PHONEPE_CLIENT_VERSION
  );
}

export async function createPhonePePaymentUrl(payload) {
  const client = getClientInstance();
  
  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(payload.merchantOrderId)
    .amount(payload.amount) // In paisa (e.g., total * 100)
    .redirectUrl(payload.redirectUrl)
    .build();

  const response = await client.pay(request);
  return response;
}

export async function fetchPhonePeOrderStatus(merchantOrderId) {
  const client = getClientInstance();
  const response = await client.getOrderStatus(merchantOrderId);
  return response;
}

export function extractPhonePeRedirectUrl(payload) {
  return payload?.redirectUrl
    || payload?.paymentUrl
    || payload?.tokenUrl
    || payload?.data?.redirectUrl
    || payload?.data?.paymentUrl
    || payload?.data?.tokenUrl
    || payload?.data?.instrumentResponse?.redirectInfo?.url
    || payload?.instrumentResponse?.redirectInfo?.url
    || null;
}

export function extractPhonePeState(payload) {
  return String(
    payload?.state
    || payload?.status
    || payload?.paymentState
    || payload?.data?.state
    || payload?.data?.status
    || payload?.data?.paymentState
    || payload?.data?.orderStatus
    || ''
  ).toUpperCase();
}

export function mapPhonePeStateToOrderStatus(payload) {
  const state = extractPhonePeState(payload);

  if (['COMPLETED', 'SUCCESS', 'PAYMENT_SUCCESS', 'PAID'].includes(state)) {
    return 'succeeded';
  }

  if (['FAILED', 'PAYMENT_FAILED', 'PAYMENT_ERROR', 'CANCELLED', 'EXPIRED'].includes(state)) {
    return 'failed';
  }

  return 'created';
}

import crypto from 'crypto';

export function validatePhonePeCallback(body, headers) {
  const response = body?.response;
  const xVerify = headers['x-verify'] || headers['x-verify-signature'];
  if (!response || !xVerify) return false;

  let saltKey = process.env.PHONEPE_CLIENT_SECRET || '';
  let saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

  if (saltKey.includes('###')) {
    const parts = saltKey.split('###');
    saltKey = parts[0];
    saltIndex = parts[1];
  }

  const hash = crypto.createHash('sha256')
    .update(response + saltKey)
    .digest('hex');

  const expected = `${hash}###${saltIndex}`;
  return xVerify === expected;
}

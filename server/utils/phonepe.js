const DEFAULT_PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

function getPhonePeBaseUrl() {
  return process.env.PHONEPE_BASE_URL || DEFAULT_PHONEPE_BASE_URL;
}

export function isPhonePeConfigured() {
  return Boolean(
    process.env.PHONEPE_CLIENT_ID
    && process.env.PHONEPE_CLIENT_SECRET
    && process.env.PHONEPE_CLIENT_VERSION
  );
}

export async function fetchPhonePeAccessToken() {
  const response = await fetch(`${getPhonePeBaseUrl()}/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.PHONEPE_CLIENT_ID,
      client_version: process.env.PHONEPE_CLIENT_VERSION,
      client_secret: process.env.PHONEPE_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error_description || 'PhonePe auth token request failed');
  }

  return data.access_token || data.accessToken || data.token;
}

export async function createPhonePePaymentUrl(payload) {
  const accessToken = await fetchPhonePeAccessToken();
  const response = await fetch(`${getPhonePeBaseUrl()}/checkout/v2/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error_description || 'PhonePe payment URL request failed');
  }

  return data;
}

export async function fetchPhonePeOrderStatus(merchantOrderId) {
  const accessToken = await fetchPhonePeAccessToken();
  const response = await fetch(`${getPhonePeBaseUrl()}/checkout/v2/order/${merchantOrderId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error_description || 'PhonePe order status request failed');
  }

  return data;
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

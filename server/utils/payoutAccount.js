import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

function getKey() {
  const secret = process.env.PAYOUT_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error('Payout encryption key is not configured');
  return crypto.createHash('sha256').update(secret).digest().subarray(0, KEY_LENGTH);
}

export function encryptPayoutValue(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`;
}

export function maskAccountNumber(last4) {
  return last4 ? `•••• ${last4}` : null;
}

export function payoutAccountView(account) {
  if (!account) return null;
  return {
    bankName: account.bankName || '',
    accountType: account.accountType || '',
    accountHolderName: account.accountHolderName || '',
    ifscCode: account.ifscCode || '',
    upiId: account.upiId || '',
    maskedAccountNumber: maskAccountNumber(account.accountNumberLast4),
    verificationStatus: account.verificationStatus || 'not_configured',
    updatedAt: account.updatedAt,
  };
}

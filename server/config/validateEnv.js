export function validateEnv() {
  const required = ['JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const prodRequired = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const key of prodRequired) {
      if (!process.env[key]) {
        throw new Error(`Missing production-required env var: ${key}`);
      }
    }

    const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
    const hasPhonePe = Boolean(
      process.env.PHONEPE_CLIENT_ID
      && process.env.PHONEPE_CLIENT_SECRET
      && process.env.PHONEPE_CLIENT_VERSION
    );

    if (!hasStripe && !hasPhonePe) {
      throw new Error('Missing production payment gateway configuration. Configure Stripe or PhonePe.');
    }
  } else {
    // Non-prod: warn about useful vars that are commonly forgotten
    const niceToHave = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const k of niceToHave) {
      if (!process.env[k]) console.warn(`Warning: recommended env var not set: ${k}`);
    }
  }
}

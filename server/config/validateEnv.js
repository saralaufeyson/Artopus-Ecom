export function validateEnv() {
  const required = ['JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const prodRequired = [
      'MONGO_URI',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USERNAME',
      'SMTP_PASSWORD',
      'SMTP_FROM',
      'PHONEPE_CLIENT_ID',
      'PHONEPE_CLIENT_SECRET',
      'PHONEPE_CLIENT_VERSION',
    ];
    for (const key of prodRequired) {
      if (!process.env[key]) {
        throw new Error(`Missing production-required env var: ${key}`);
      }
    }

  } else {
    // Non-prod: warn about useful vars that are commonly forgotten
    const niceToHave = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const k of niceToHave) {
      if (!process.env[k]) console.warn(`Warning: recommended env var not set: ${k}`);
    }
  }
}

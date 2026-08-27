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
      'PHONEPE_CLIENT_ID',
      'PHONEPE_CLIENT_SECRET',
      'PHONEPE_CLIENT_VERSION',
    ];
    for (const key of prodRequired) {
      if (!process.env[key]) {
        throw new Error(`Missing production-required env var: ${key}`);
      }
    }

    const hasSmtp = Boolean(
      process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USERNAME
      && process.env.SMTP_PASSWORD
      && process.env.SMTP_FROM
    );
    const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
    if (!hasSmtp && !hasResend) {
      throw new Error('Missing production email configuration. Configure SMTP or Resend.');
    }

  } else {
    // Non-prod: warn about useful vars that are commonly forgotten
    const niceToHave = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const k of niceToHave) {
      if (!process.env[k]) console.warn(`Warning: recommended env var not set: ${k}`);
    }
  }
}

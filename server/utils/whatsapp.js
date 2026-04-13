function isWhatsAppConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && process.env.TWILIO_WHATSAPP_FROM
  );
}

function normalizeWhatsAppNumber(number) {
  if (!number) return null;
  return number.startsWith('whatsapp:') ? number : `whatsapp:${number}`;
}

export async function sendWhatsAppMessage(to, body) {
  if (!isWhatsAppConfigured()) return { skipped: true, reason: 'not_configured' };

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: normalizeWhatsAppNumber(process.env.TWILIO_WHATSAPP_FROM),
      To: normalizeWhatsAppNumber(to),
      Body: body,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'WhatsApp delivery request failed');
  }

  return data;
}

export function buildTrackingWhatsAppMessage(order, status) {
  const trackingLine = order.trackingUrl
    ? ` Track here: ${order.trackingUrl}`
    : order.trackingNumber
      ? ` Tracking number: ${order.trackingNumber}.`
      : '';

  if (status === 'shipped') {
    return `Your Artopus order ${order._id} has shipped with ${order.deliveryPartner || 'our logistics partner'}.${trackingLine}`;
  }

  if (status === 'delivered') {
    return `Your Artopus order ${order._id} has been marked delivered. We hope you love it.`;
  }

  return `Your Artopus order ${order._id} status is now ${status}.${trackingLine}`;
}

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials exist
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS message to a specified phone number
 * @param {string} to - Recipient phone number (in E.164 format, e.g. +919876543210)
 * @param {string} body - The text message body
 */
export async function sendSMS(to, body) {
  if (!client) {
    console.warn('[SMS Log (Unconfigured)] message not sent to:', to, 'body:', body);
    return null;
  }

  try {
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`SMS successfully sent to ${to}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error.message);
    throw error;
  }
}

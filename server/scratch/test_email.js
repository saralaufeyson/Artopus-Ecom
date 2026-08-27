import dotenv from 'dotenv';
dotenv.config();

import { emailService } from '../utils/emailService.js';

async function run() {
  console.log('Sending test email using Hostinger SMTP...');
  try {
    const info = await emailService.sendVerificationEmail('saralaufeysonlaya08@gmail.com', '987654');
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

run();

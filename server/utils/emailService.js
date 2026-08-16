import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (process.env.NODE_ENV === 'test') {
      return {
        sendMail: async (options) => {
          console.log(`[Mock Email] Bypassed real mail. To: ${options.to}, Subject: ${options.subject}`);
          return { messageId: 'mock-message-id' };
        }
      };
    }

    if (!this.transporter) {
      const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
      const port = parseInt(process.env.SMTP_PORT || '465', 10);
      const user = process.env.SMTP_USERNAME || 'contact@artopusindia.com';
      const pass = process.env.SMTP_PASSWORD;
      const from = process.env.SMTP_FROM || 'contact@artopusindia.com';

      // Always secure for port 465, else false
      const secure = port === 465;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000, // 15 seconds
        socketTimeout: 15000, // 15 seconds
      });

      this.fromAddress = from;
    }
    return this.transporter;
  }

  async sendVerificationEmail(toEmail, otp) {
    if (!toEmail) throw new Error('Recipient email is required');

    const transporter = this.getTransporter();
    const from = this.fromAddress || process.env.SMTP_FROM || 'contact@artopusindia.com';

    const info = await transporter.sendMail({
      from: `"Artopus Support" <${from}>`,
      to: toEmail,
      subject: 'Verify Your Artopus Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Verify Your Account</h2>
          <p>Thank you for registering with Artopus. Please use the following One-Time Password (OTP) to complete your email verification. This OTP is valid for 10 minutes:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you did not request this verification, please ignore this email.</p>
        </div>
      `,
    });

    return info;
  }

  async sendOrderCreatedEmail(toEmail, details) {
    if (!toEmail) return;
    const transporter = this.getTransporter();
    const from = this.fromAddress || process.env.SMTP_FROM || 'contact@artopusindia.com';

    const itemsHtml = details.items.map(item => `
      <div style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; display: flex; justify-content: space-between;">
        <span><strong>${item.quantity}x ${item.title}</strong> (${item.buyerOptionLabel || 'Original'})</span>
        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    await transporter.sendMail({
      from: `"Artopus Orders" <${from}>`,
      to: toEmail,
      subject: `Order Created! #${details.orderId.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Order Created!</h2>
          <p>Hi ${details.customerName || 'Customer'},</p>
          <p>Your order has been successfully created. We are currently awaiting payment confirmation from the gateway.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Order Summary:</h3>
            ${itemsHtml}
            <div style="margin-top: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #6366f1;">
              Total Amount: ₹${details.totalAmount.toFixed(2)}
            </div>
          </div>
          <p style="color: #64748b; font-size: 14px;">Once payment is cleared, we will send your payment receipt and start preparing your shipment.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Order creation pending-payment email successfully sent to: ${toEmail} for Order #${details.orderId}`);
  }

  async sendOrderConfirmationEmail(toEmail, details) {
    if (!toEmail) return;
    const transporter = this.getTransporter();
    const from = this.fromAddress || process.env.SMTP_FROM || 'contact@artopusindia.com';

    const itemsHtml = details.items.map(item => `
      <div style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; display: flex; justify-content: space-between;">
        <span><strong>${item.quantity}x ${item.title}</strong> (${item.buyerOptionLabel || 'Original'})</span>
        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    await transporter.sendMail({
      from: `"Artopus Orders" <${from}>`,
      to: toEmail,
      subject: `Order Confirmed! #${details.orderId.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Order Confirmed!</h2>
          <p>Hi ${details.customerName || 'Customer'},</p>
          <p>Thank you for shopping with Artopus. Your payment has been successfully processed, and your order is being prepared.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Order Summary:</h3>
            ${itemsHtml}
            <div style="margin-top: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #6366f1;">
              Total: ₹${details.totalAmount.toFixed(2)}
            </div>
          </div>
          <p style="color: #64748b; font-size: 14px;">We'll notify you as soon as your items are shipped with tracking info.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Order confirmation email successfully sent to: ${toEmail} for Order #${details.orderId}`);
  }

  async sendOrderShippedEmail(toEmail, details) {
    if (!toEmail) return;
    const transporter = this.getTransporter();
    const from = this.fromAddress || process.env.SMTP_FROM || 'contact@artopusindia.com';

    await transporter.sendMail({
      from: `"Artopus Shipping" <${from}>`,
      to: toEmail,
      subject: `Your Artopus Order has Shipped! #${details.orderId.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">On Its Way!</h2>
          <p>Hi ${details.customerName || 'Customer'},</p>
          <p>Great news! Your order has been handed over to our delivery partner and is on its way to you.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Delivery Information:</h3>
            <p><strong>Courier:</strong> ${details.deliveryPartner || 'Standard Partner'}</p>
            <p><strong>Tracking Number:</strong> ${details.trackingNumber || 'N/A'}</p>
            ${details.trackingUrl ? `<p><a href="${details.trackingUrl}" style="background-color: #6366f1; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-top: 10px;">Track Order</a></p>` : ''}
          </div>
        </div>
      `,
    });
    console.log(`[Email Service] Shipping notification email successfully sent to: ${toEmail} for Order #${details.orderId}`);
  }

  async sendOrderDeliveredEmail(toEmail, details) {
    if (!toEmail) return;
    const transporter = this.getTransporter();
    const from = this.fromAddress || process.env.SMTP_FROM || 'contact@artopusindia.com';

    await transporter.sendMail({
      from: `"Artopus Delivery" <${from}>`,
      to: toEmail,
      subject: `Delivered! #${details.orderId.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">Order Delivered</h2>
          <p>Hi ${details.customerName || 'Customer'},</p>
          <p>Your order has been marked as successfully delivered. We hope you love your new artwork!</p>
          <p>If you have any feedback or concerns, please don't hesitate to reach out to us.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Delivery notification email successfully sent to: ${toEmail} for Order #${details.orderId}`);
  }
}

export const emailService = new EmailService();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendArtistOrderNotification = async (artistEmail, orderDetails) => {
  if (!artistEmail) return;

  try {
    const info = await transporter.sendMail({
      from: '"Artopus Art Shop" <orders@artopus.com>',
      to: artistEmail,
      subject: `New Order for Your Artwork! #${orderDetails.orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">You have a new order!</h2>
          <p>Hello Artist,</p>
          <p>Great news! Someone just purchased your artwork.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Item:</strong> ${orderDetails.itemTitle}</p>
            <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
            <p><strong>Total for this item:</strong> $${orderDetails.price * orderDetails.quantity}</p>
          </div>
          <p>Please log in to your dashboard to manage this order and view more details.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated notification from Artopus.</p>
        </div>
      `,
    });
    console.log('Order notification sent to artist:', artistEmail, info.messageId);
  } catch (error) {
    console.error('Error sending artist notification:', error);
  }
};

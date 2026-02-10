
import nodemailer from 'nodemailer';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';

export class MailService {
  private static getTransporter() {
    // Modern GoDaddy/Office 365 accounts use smtp.office365.com
    const host = process.env.SMTP_HOST || 'smtp.office365.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true'; // false for 587

    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER || 'support@kangpack.in',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  }

  private static transporter = MailService.getTransporter();

  public static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const fromName = process.env.FROM_NAME || 'Kangpack Support';
      const fromEmail = process.env.FROM_EMAIL || 'support@kangpack.in';

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      console.log(`[MailService] Email sent successfully to ${to}`);
    } catch (error: any) {
      console.error('[MailService] FAILED to send email to:', to);
      console.error('[MailService] Error Details:', error.message || error);
      // In production, you might want to throw here or use a retry queue
    }
  }

  public static async sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Identity Recovery</h1>
        </div>
        <div style="padding: 40px; background-color: #F9F7F4;">
          <p>Hi there,</p>
          <p>We received a request to reset the password for your Kangpack account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6B4A2D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Reset My Password</a>
          </div>
          <p style="font-size: 14px; color: #888;">This link will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;
    
    await this.sendEmail(to, subject, html);
  }

  public static async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    const subject = 'Verify your email address';
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Verify Your Identity</h1>
        </div>
        <div style="padding: 40px; background-color: #F9F7F4;">
          <p>Hi there,</p>
          <p>Thank you for joining Kangpack. Please verify your email address to unlock full access to your account and mobile productivity gear.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #6B4A2D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Confirm My Email</a>
          </div>
          <p style="font-size: 14px; color: #888;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  public static async sendAccountCreatedEmail(to: string, password: string, verificationUrl: string): Promise<void> {
    const subject = 'Your Kangpack Account Details';
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Welcome to Kangpack</h1>
        </div>
        <div style="padding: 40px; background-color: #F9F7F4;">
          <p>Hi there,</p>
          <p>Your account was successfully created during your checkout. Here are your temporary login details:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 5px 0 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>
          <p>Please verify your email address to secure your account:</p>
          <a href="${verificationUrl}" style="background-color: #6B4A2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Verify My Account</a>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">We recommend changing your password after your first login.</p>
        </div>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  public static async sendOrderConfirmationEmail(order: any): Promise<void> {
    const subject = `Order Confirmed - ${order.orderNumber}`;
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 15px 10px; border-bottom: 1px solid #efefef;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width: 80px; vertical-align: top;">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0;" />
              </td>
              <td style="vertical-align: top; padding-left: 15px;">
                <strong style="color: #3E2A1D; font-size: 14px;">${item.name}</strong><br>
                <span style="color: #888; font-size: 12px;">Quantity: ${item.quantity}</span>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #efefef; text-align: right; vertical-align: top;">
          <strong style="color: #6B4A2D;">INR ${item.price.toLocaleString()}</strong>
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Thank You for Your Order</h1>
          <p style="margin: 10px 0 0; opacity: 0.8;">Your premium selection is being prepared.</p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; background-color: #F9F7F4;">
          <div style="margin-bottom: 30px;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #3E2A1D;">Item</th>
                <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #3E2A1D;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 20px 0 5px; font-weight: bold;">Subtotal</td>
                <td style="padding: 20px 0 5px; text-align: right;">INR ${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Shipping</td>
                <td style="padding: 5px 0; text-align: right;">INR ${order.shippingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Tax (10%)</td>
                <td style="padding: 5px 0; text-align: right;">INR ${order.taxAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-top: 2px solid #3E2A1D; font-size: 18px; font-weight: bold;">Total</td>
                <td style="padding: 15px 0; border-top: 2px solid #3E2A1D; font-size: 18px; font-weight: bold; text-align: right; color: #6B4A2D;">INR ${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h3 style="margin-top: 0; color: #6B4A2D; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
            <p style="margin: 0; font-size: 14px; color: #555;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <div style="margin-top: 20px; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; background-color: #ffffff;">
            <p style="margin: 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            ${order.paymentMethod === 'cod' ? '<p style="margin: 5px 0 0; font-size: 13px; color: #6B4A2D;">Please have the exact amount ready in cash when your order arrives.</p>' : ''}
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #888;">
            <p>If you have any questions, please reply to this email or visit our support page.</p>
            <p>&copy; ${new Date().getFullYear()} Ecommerce Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail(order.email, subject, html);
  }

  public static async sendPaymentReceivedEmail(order: any): Promise<void> {
    const subject = `Payment Received - Order ${order.orderNumber}`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Payment Successful</h1>
        </div>
        <div style="padding: 40px; background-color: #F9F7F4;">
          <p>We've successfully received your payment for order <strong>${order.orderNumber}</strong>.</p>
          <p>Our team is now processing your order for shipment. You will receive another update once your package is on its way.</p>
          <div style="margin-top: 30px; text-align: center;">
             <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/order-history" style="background-color: #6B4A2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">View Order History</a>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail(order.email, subject, html);
  }

  public static async sendOrderStatusUpdateEmail(order: any, status: string): Promise<void> {
    const subject = `Order Update - ${order.orderNumber} is now ${status}`;
    let statusMessage = '';
    
    if (status.toLowerCase() === 'shipped') {
      statusMessage = `Great news! Your order <strong>${order.orderNumber}</strong> has been shipped and is on its way to you.`;
    } else if (status.toLowerCase() === 'cancelled') {
      statusMessage = `Your order <strong>${order.orderNumber}</strong> has been cancelled. If this was a mistake, please contact our support team.`;
    } else if (status.toLowerCase() === 'delivered') {
      statusMessage = `Your order <strong>${order.orderNumber}</strong> has been delivered. Enjoy your premium minimalist gear!`;
    } else {
      statusMessage = `The status of your order <strong>${order.orderNumber}</strong> has been updated to ${status}.`;
    }

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E2A1D; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Order Update</h1>
        </div>
        <div style="padding: 40px; background-color: #F9F7F4;">
          <p>${statusMessage}</p>
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
          <div style="margin-top: 30px; text-align: center;">
             <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/order-tracking/${order._id}" style="background-color: #6B4A2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Track My Order</a>
          </div>
          <p style="margin-top: 40px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} Kangpack. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(order.email, subject, html);
  }
}

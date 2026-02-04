
import nodemailer from 'nodemailer';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';

export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'ethereal_user', // Fallback for dev
      pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
  });

  public static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      // In development, if no real SMTP credentials, we might want to log or skip
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log(`[MailService] Mocking email send to ${to}`);
        console.log(`[MailService] Subject: ${subject}`);
        console.log(`[MailService] Body: ${html}`);
        return;
      }

      await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Ecommerce Platform'}" <${process.env.FROM_EMAIL || 'noreply@ecommerce.com'}>`,
        to,
        subject,
        html,
      });
      console.log(`[MailService] Email sent to ${to}`);
    } catch (error) {
      console.error('[MailService] Error sending email:', error);
      // Don't throw error to avoid breaking the auth flow, but log it
    }
  }

  public static async sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #6B4A2D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, user simply ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
        <p>Or copy and paste this link: ${resetUrl}</p>
      </div>
    `;
    
    await this.sendEmail(to, subject, html);
  }

  public static async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    const subject = 'Verify your email address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #6B4A2D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Or copy and paste this link: ${verificationUrl}</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }
}

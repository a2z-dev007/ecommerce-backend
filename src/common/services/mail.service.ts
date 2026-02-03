
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
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

  private static resend = new Resend(process.env.RESEND_API_KEY);

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

  public static async sendEmailWithResend(to: string, subject: string, html: string): Promise<void> {
    try {
      const data = await this.resend.emails.send({
        from: 'Ecommerce Platform <onboarding@resend.dev>', // Default for testing
        to: [to],
        subject: subject,
        html: html,
      });
      
      if (data.error) {
        console.error('[MailService] Resend API Error:', data.error);
        return;
      }

      console.log('[MailService] Email sent with Resend:', data);
    } catch (error) {
      console.error('[MailService] Error sending email with Resend:', error);
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
    
    if (process.env.RESEND_API_KEY) {
        await this.sendEmailWithResend(to, subject, html);
    } else {
        await this.sendEmail(to, subject, html);
    }
  }
}

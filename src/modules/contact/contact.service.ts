
import { MailService } from '../../common/services/mail.service';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS } from '../../common/constants';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export class ContactService {
  public static async submitContactForm(data: ContactFormData): Promise<void> {
    const { firstName, lastName, email, phone, message } = data;
    const name = `${firstName} ${lastName}`.trim();

    // Email to Admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;

    // Send using Resend (or fallback)
    if (process.env.RESEND_API_KEY) {
        // Send to admin email (defined in environment or default)
        const adminEmail = process.env.CONTACT_EMAIL || process.env.FROM_EMAIL || 'support@kangpack.com';
        await MailService.sendEmailWithResend(adminEmail, `New Contact from ${name}`, adminHtml);
        
        // Optional: Send auto-reply to user
        // await MailService.sendEmailWithResend(email, "We received your message", "<p>Thanks for contacting us...</p>");
    } else {
         // Fallback to nodemailer if no Resend key (though logic is now inside MailService mostly)
         const adminEmail = process.env.CONTACT_EMAIL || process.env.FROM_EMAIL || 'support@kangpack.com';
         await MailService.sendEmail(adminEmail, `New Contact from ${name}`, adminHtml);
    }
  }
}

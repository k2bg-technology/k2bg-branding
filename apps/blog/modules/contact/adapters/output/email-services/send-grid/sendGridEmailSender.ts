import sgMail, { type MailService, ResponseError } from '@sendgrid/mail';

import type { Contact, EmailSender } from '../../../../domain';
import { EmailSendFailedError } from '../../../../domain';

/**
 * SendGrid Email Sender Adapter
 *
 * Implements EmailSender interface using SendGrid as the email service provider.
 */
export class SendGridEmailSender implements EmailSender {
  private readonly mailService: MailService;
  private readonly senderEmail: string;

  constructor(apiKey: string, senderEmail: string) {
    this.mailService = sgMail;
    this.mailService.setApiKey(apiKey);
    this.senderEmail = senderEmail;
  }

  async send(
    contact: Contact,
    subject: string,
    htmlBody: string
  ): Promise<void> {
    const message = {
      to: contact.email.getValue(),
      from: this.senderEmail,
      bcc: this.senderEmail,
      subject,
      html: htmlBody,
    };

    try {
      await this.mailService.send(message);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new EmailSendFailedError(String(error.response.body));
      }
      throw new EmailSendFailedError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}

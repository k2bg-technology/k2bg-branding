import sgMail, { type MailService, ResponseError } from '@sendgrid/mail';

import type { Contact, EmailSender } from '../../../../domain';
import { EmailSendError } from '../../../../domain';

export class SendGridEmailSender implements EmailSender {
  private sgMail: MailService;

  constructor() {
    this.sgMail = sgMail;
    this.sgMail.setApiKey(process.env.SEND_GRID_API_KEY ?? '');
  }

  async send(
    contact: Contact,
    subject: string,
    emailBody: string
  ): Promise<void> {
    const message = {
      to: contact.email.getValue(),
      from: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      bcc: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      subject,
      html: emailBody,
    };

    try {
      await this.sgMail.send(message);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new EmailSendError(
          `Failed to send email: ${error.message}`,
          error
        );
      }
      throw new EmailSendError('Unknown error occurred while sending email');
    }
  }
}

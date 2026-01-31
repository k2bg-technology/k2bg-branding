import sgMail, { type MailService, ResponseError } from '@sendgrid/mail';

import type { Contact, EmailSender } from '../../../../domain';
import { EmailSendError } from '../../../shared/errors';

export class SendGridEmailSender implements EmailSender {
  private sgMail: MailService;

  constructor() {
    this.sgMail = sgMail;
    this.sgMail.setApiKey(process.env.SEND_GRID_API_KEY ?? '');
  }

  async sendEmail(
    contact: Contact,
    subject: string,
    emailBody: string
  ): Promise<void> {
    const visitor = contact.toObject();
    const message = {
      to: visitor.email,
      from: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      bcc: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      subject,
      html: emailBody,
    };

    try {
      await this.sgMail.send(message);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new EmailSendError(error.response.body as string);
      }
      throw new EmailSendError('Unknown error occurred while sending email');
    }
  }
}

import type { EmailSender, Visitor } from '../../../../domain';

import { SendGridCore } from './core';

export class SendGridEmailSender extends SendGridCore implements EmailSender {
  async sendEmail(
    visitor: Visitor,
    subject: string,
    emailBody: string
  ): Promise<void> {
    const message = {
      to: visitor.email,
      from: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      bcc: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN || '',
      subject,
      html: emailBody,
    };
    await this.send(message);
  }
}

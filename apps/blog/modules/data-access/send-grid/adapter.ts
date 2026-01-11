import type * as Domain from '../../domain';

import { Core } from './core';

export class Adapter extends Core implements Domain.Contact.Adapter {
  async sendEmail(
    visitor: Domain.Contact.Visitor,
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

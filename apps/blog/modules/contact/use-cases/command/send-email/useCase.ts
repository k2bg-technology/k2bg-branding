import { format } from 'date-fns';
import path from 'path';

import { generateHtmlTemplate } from '../../../adapters/shared';
import { Contact } from '../../../domain';
import type { EmailSender } from './emailSender';

export interface SendEmailInput {
  name: string;
  email: string;
  message: string;
}

/**
 * SendEmail Use Case
 *
 * Sends a confirmation email to the contact form submitter.
 */
export class SendEmail {
  constructor(private readonly emailSender: EmailSender) {}

  async execute(input: SendEmailInput): Promise<void> {
    const contact = Contact.create(input);

    const emailBody = generateHtmlTemplate(
      path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
      {
        name: contact.name.getValue(),
        message: contact.message.getValue(),
        year: format(new Date(), 'yyyy'),
      }
    );

    const subject = `${contact.name.getValue()} 様。お問合せいただきありがとうございます。`;

    await this.emailSender.send(contact, subject, emailBody);
  }
}

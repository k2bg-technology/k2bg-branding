import { format } from 'date-fns';
import path from 'path';

import { generateHtmlTemplate } from '../../../adapters/shared';
import { Contact, Email, type EmailSender, Message, Name } from '../../../domain';
import type { SendEmailInput, SendEmailOutput } from '../../shared';

export class SendEmail {
  constructor(private readonly emailSender: EmailSender) {}

  async execute(input: SendEmailInput): Promise<SendEmailOutput> {
    const name = Name.create(input.name);
    const email = Email.create(input.email);
    const message = Message.create(input.message);

    const contact = Contact.create({ name, email, message });

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

    return { success: true };
  }
}

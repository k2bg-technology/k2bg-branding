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

    const sharedTemplateValues = {
      name: contact.name.getValue(),
      year: format(new Date(), 'yyyy'),
      companyLogoUrl: process.env.COMPANY_LOGO_URL ?? '',
    };

    const ownerEmailBody = generateHtmlTemplate(
      path.join(
        process.cwd(),
        'app',
        '_mail-templates',
        'contact-notification.hbs'
      ),
      {
        ...sharedTemplateValues,
        email: contact.email.getValue(),
        message: contact.message.getValue(),
      }
    );

    const visitorEmailBody = generateHtmlTemplate(
      path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
      sharedTemplateValues
    );

    const visitorSubject = `${contact.name.getValue()} 様。お問合せいただきありがとうございます。`;
    const ownerSubject = `${contact.name.getValue()} 様からお問合せが届きました。`;

    await this.emailSender.sendToOwner(ownerSubject, ownerEmailBody);
    await this.emailSender.sendToVisitor(
      contact,
      visitorSubject,
      visitorEmailBody
    );
  }
}

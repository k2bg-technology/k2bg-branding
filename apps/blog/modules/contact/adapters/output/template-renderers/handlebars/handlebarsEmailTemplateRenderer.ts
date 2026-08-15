import { format } from 'date-fns';
import path from 'path';

import type { Contact, EmailTemplateRenderer } from '../../../../domain';
import { generateHtmlTemplate, RepositoryError } from '../../../shared';

export class HandlebarsEmailTemplateRenderer implements EmailTemplateRenderer {
  renderOwnerNotification(contact: Contact): string {
    try {
      return generateHtmlTemplate(
        path.join(
          process.cwd(),
          'app',
          '_mail-templates',
          'contact-notification.hbs'
        ),
        {
          ...sharedTemplateValues(contact),
          email: contact.email.getValue(),
          message: contact.message.getValue(),
        }
      );
    } catch (error) {
      throw new RepositoryError('Failed to render email template', error);
    }
  }

  renderVisitorConfirmation(contact: Contact): string {
    try {
      return generateHtmlTemplate(
        path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
        sharedTemplateValues(contact)
      );
    } catch (error) {
      throw new RepositoryError('Failed to render email template', error);
    }
  }
}

function sharedTemplateValues(contact: Contact) {
  return {
    name: contact.name.getValue(),
    year: format(new Date(), 'yyyy'),
    companyLogoUrl: process.env.COMPANY_LOGO_URL ?? '',
  };
}

import { format } from 'date-fns';
import path from 'path';

import type { Contact, EmailTemplateRenderer } from '../../../../domain';
import { generateHtmlTemplate, RepositoryError } from '../../../shared';

export class HandlebarsEmailTemplateRenderer implements EmailTemplateRenderer {
  render(contact: Contact): string {
    try {
      return generateHtmlTemplate(
        path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
        {
          name: contact.name.getValue(),
          message: contact.message.getValue(),
          year: format(new Date(), 'yyyy'),
          companyLogoUrl: process.env.COMPANY_LOGO_URL ?? '',
        }
      );
    } catch (error) {
      throw new RepositoryError('Failed to render email template', error);
    }
  }
}

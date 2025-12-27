import path from 'path';

import { format } from 'date-fns';

import * as Domain from '../../domain';
import { generateHtmlTemplate } from '../../utility/generateHtmlTemplate';

export class SendEmail {
  constructor(
    private ContactAdapter: Domain.Contact.Adapter
  ) {}

  async execute(visitor: Domain.Contact.Visitor) {
    const emailBody = generateHtmlTemplate(
      path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
      {
        name: visitor.name,
        message: visitor.message,
        year: format(new Date(), 'yyyy'),
      }
    );

    await this.ContactAdapter.sendEmail(
      visitor,
      `${visitor.name} 様。お問合せいただきありがとうございます。`,
      emailBody
    );
  }
}

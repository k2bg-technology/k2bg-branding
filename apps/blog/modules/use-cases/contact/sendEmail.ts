import { format } from 'date-fns';

import * as Domain from '../../domain';
import { generateHtmlTemplate } from '../../utility/generateHtmlTemplate';

export class SendEmail {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private ContactAdapter: Domain.Contact.Adapter // eslint-disable-next-line no-empty-function
  ) {}

  async execute(visitor: Domain.Contact.Visitor) {
    const emailBody = generateHtmlTemplate(
      'assets/mail-templates/contact.hbs',
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

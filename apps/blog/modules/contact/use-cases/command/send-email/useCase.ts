import { format } from 'date-fns';
import path from 'path';
import { generateHtmlTemplate } from '../../../adapters';
import type { EmailSender, Visitor } from '../../../domain';
import { SendEmailError } from '../../shared';

/**
 * SendEmail Use Case
 *
 * Sends a confirmation email to the visitor who submitted the contact form.
 */
export class SendEmail {
  constructor(private readonly emailSender: EmailSender) {}

  async execute(visitor: Visitor): Promise<void> {
    try {
      const emailBody = generateHtmlTemplate(
        path.join(process.cwd(), 'app', '_mail-templates', 'contact.hbs'),
        {
          name: visitor.name,
          message: visitor.message,
          year: format(new Date(), 'yyyy'),
        }
      );

      await this.emailSender.sendEmail(
        visitor,
        `${visitor.name} 様。お問合せいただきありがとうございます。`,
        emailBody
      );
    } catch (error) {
      if (error instanceof SendEmailError) {
        throw error;
      }
      throw new SendEmailError(error);
    }
  }
}

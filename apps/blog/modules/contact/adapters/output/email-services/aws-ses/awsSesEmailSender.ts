import {
  type SESClient,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-ses';

import type { Contact, EmailSender } from '../../../../domain';
import { EmailSendFailedError } from '../../../../domain';

/**
 * AWS SES Email Sender Adapter
 *
 * Implements EmailSender interface using AWS SES as the email service provider.
 */
export class AwsSesEmailSender implements EmailSender {
  constructor(
    private readonly sesClient: SESClient,
    private readonly senderEmail: string
  ) {}

  async send(
    contact: Contact,
    subject: string,
    htmlBody: string
  ): Promise<void> {
    const params: SendEmailCommandInput = {
      Source: this.senderEmail,
      Destination: {
        ToAddresses: [contact.email.getValue()],
        BccAddresses: [this.senderEmail],
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
      },
    };

    try {
      await this.sesClient.send(new SendEmailCommand(params));
    } catch (error) {
      if (error instanceof Error) {
        throw new EmailSendFailedError(error.message);
      }
      throw new EmailSendFailedError('Unknown error occurred');
    }
  }
}

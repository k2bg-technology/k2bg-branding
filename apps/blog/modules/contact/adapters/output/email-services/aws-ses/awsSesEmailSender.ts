import {
  type SESClient,
  SESServiceException,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-ses';

import type { Contact, EmailSender } from '../../../../domain';
import { EmailSendFailedError } from '../../../../domain';
import { contactLogger } from '../../../shared';

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
      contactLogger.info('Email sent successfully via AWS SES');
    } catch (error) {
      if (error instanceof SESServiceException) {
        contactLogger.error({ err: error }, 'AWS SES service error');
        throw new EmailSendFailedError(`[${error.name}] ${error.message}`);
      }
      contactLogger.error(
        { err: error },
        'Unexpected error sending email via AWS SES'
      );
      throw new EmailSendFailedError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}

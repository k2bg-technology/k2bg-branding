import { SendGridEmailSender } from '../../modules/contact/adapters/output';
import { SendEmail } from '../../modules/contact/use-cases/command/send-email';

export function createSendEmailUseCase(): SendEmail {
  return new SendEmail(new SendGridEmailSender());
}

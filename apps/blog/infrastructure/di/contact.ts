import { SendEmail, SendGridEmailSender } from '../../modules/contact';

export function createSendEmailUseCase(): SendEmail {
  return new SendEmail(new SendGridEmailSender());
}

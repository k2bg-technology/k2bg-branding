import { SendEmail } from '../../modules/contact/use-cases';
import { getSendGridEmailSender } from '../sendgrid';

export function createSendEmailUseCase(): SendEmail {
  return new SendEmail(getSendGridEmailSender());
}

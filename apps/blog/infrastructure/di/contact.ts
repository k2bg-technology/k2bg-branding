import { SendEmail } from '../../modules/contact/use-cases';
import { getAwsSesEmailSender } from '../aws-ses';

export function createSendEmailUseCase(): SendEmail {
  return new SendEmail(getAwsSesEmailSender());
}

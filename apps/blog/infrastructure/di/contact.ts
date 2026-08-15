import { getDrizzleClient } from '../drizzle';
import { HandlebarsEmailTemplateRenderer } from '../../modules/contact/adapters';
import { SendEmail } from '../../modules/contact/use-cases';
import { EnforceContactRateLimit } from '../../modules/contact/use-cases/command/enforce-rate-limit';
import { DrizzleContactSubmissionRepository } from '../../modules/contact/adapters/output';
import { getAwsSesEmailSender } from '../aws-ses';

export function createSendEmailUseCase(): SendEmail {
  return new SendEmail(
    getAwsSesEmailSender(),
    new HandlebarsEmailTemplateRenderer()
  );
}

export function createEnforceContactRateLimitUseCase(): EnforceContactRateLimit {
  const db = getDrizzleClient();
  return new EnforceContactRateLimit(
    new DrizzleContactSubmissionRepository(db)
  );
}

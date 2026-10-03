import { HandlebarsEmailTemplateRenderer } from '../../modules/contact/adapters';
import { DrizzleContactSubmissionRepository } from '../../modules/contact/adapters/output';
import { SendEmail } from '../../modules/contact/use-cases';
import { EnforceContactRateLimit } from '../../modules/contact/use-cases/command/enforce-rate-limit';
import { getAwsSesEmailSender } from '../aws-ses';
import { getDrizzleClient } from '../drizzle';

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

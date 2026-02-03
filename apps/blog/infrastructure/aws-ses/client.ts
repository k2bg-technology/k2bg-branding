import { SESClient } from '@aws-sdk/client-ses';

import { AwsSesEmailSender } from '../../modules/contact/adapters';

export interface AwsSesConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  senderEmail: string;
}

let emailSenderInstance: AwsSesEmailSender | null = null;
let currentConfig: AwsSesConfig | null = null;

function createDefaultConfig(): AwsSesConfig {
  return {
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    senderEmail: process.env.AWS_SES_SENDER_EMAIL ?? '',
  };
}

/**
 * Configure the AWS SES client.
 * This should be called once before using any AWS SES operations.
 */
export function configureAwsSes(config?: Partial<AwsSesConfig>): void {
  const defaultConfig = createDefaultConfig();
  currentConfig = { ...defaultConfig, ...config };
  emailSenderInstance = null;
}

/**
 * Ensure AWS SES is configured and return the config.
 */
function getConfig(): AwsSesConfig {
  if (currentConfig === null) {
    configureAwsSes();
  }
  // After configureAwsSes(), currentConfig is guaranteed to be non-null
  // TypeScript can't infer this, so we need to check again
  if (currentConfig === null) {
    throw new Error('AWS SES configuration failed');
  }
  return currentConfig;
}

/**
 * Get the configured AWS SES EmailSender instance.
 */
export function getAwsSesEmailSender(): AwsSesEmailSender {
  const config = getConfig();

  if (!emailSenderInstance) {
    const sesClient = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    emailSenderInstance = new AwsSesEmailSender(sesClient, config.senderEmail);
  }

  return emailSenderInstance;
}

/**
 * Reset AWS SES configuration state.
 * Primarily used for testing cleanup.
 */
export function resetAwsSesConfig(): void {
  currentConfig = null;
  emailSenderInstance = null;
}

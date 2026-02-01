import { SendGridEmailSender } from '../../modules/contact/adapters';

export interface SendGridConfig {
  apiKey: string;
  senderEmail: string;
}

let emailSenderInstance: SendGridEmailSender | null = null;
let currentConfig: SendGridConfig | null = null;

function createDefaultConfig(): SendGridConfig {
  return {
    apiKey: process.env.SEND_GRID_API_KEY ?? '',
    senderEmail: process.env.SEND_GRID_SINGLE_SENDER_DOMAIN ?? '',
  };
}

/**
 * Configure the SendGrid client.
 * This should be called once before using any SendGrid operations.
 */
export function configureSendGrid(config?: Partial<SendGridConfig>): void {
  const defaultConfig = createDefaultConfig();
  currentConfig = {
    apiKey: config?.apiKey ?? defaultConfig.apiKey,
    senderEmail: config?.senderEmail ?? defaultConfig.senderEmail,
  };
  emailSenderInstance = null;
}

/**
 * Ensure SendGrid is configured and return the config.
 */
function getConfig(): SendGridConfig {
  if (currentConfig === null) {
    configureSendGrid();
  }
  // After configureSendGrid(), currentConfig is guaranteed to be non-null
  // TypeScript can't infer this, so we need to check again
  if (currentConfig === null) {
    throw new Error('SendGrid configuration failed');
  }
  return currentConfig;
}

/**
 * Get the configured SendGrid EmailSender instance.
 */
export function getSendGridEmailSender(): SendGridEmailSender {
  const config = getConfig();

  if (!emailSenderInstance) {
    emailSenderInstance = new SendGridEmailSender(
      config.apiKey,
      config.senderEmail
    );
  }

  return emailSenderInstance;
}

/**
 * Reset SendGrid configuration state.
 * Primarily used for testing cleanup.
 */
export function resetSendGridConfig(): void {
  currentConfig = null;
  emailSenderInstance = null;
}

import pino from 'pino';

/**
 * Shared root logger. Redaction paths enforce the "never log PII" rule for
 * every app; create per-module loggers with `logger.child({ module })`.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['email', 'password', '*.token', '*.apiKey'],
    censor: '[REDACTED]',
  },
});

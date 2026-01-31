import type { Visitor } from '../types';

/**
 * Port interface for email sending service.
 * Implementations (adapters) must provide concrete email delivery logic.
 */
export interface EmailSender {
  sendEmail: (
    visitor: Visitor,
    subject: string,
    message: string
  ) => Promise<void>;
}

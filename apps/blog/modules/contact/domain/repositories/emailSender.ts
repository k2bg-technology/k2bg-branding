import type { Contact } from '../entities/contact';

/**
 * EmailSender Repository Interface (Port)
 *
 * Defines the contract for sending emails in the contact domain.
 * This is a port that will be implemented by adapters (e.g., SendGrid).
 */
export interface EmailSender {
  send(contact: Contact, subject: string, htmlBody: string): Promise<void>;
}

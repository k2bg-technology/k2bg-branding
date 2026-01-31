import type { Contact } from '../entities/contact';

export interface EmailSender {
  sendEmail(contact: Contact, subject: string, emailBody: string): Promise<void>;
}

import type { Contact } from '../entities/contact';

export interface EmailSender {
  send(contact: Contact, subject: string, emailBody: string): Promise<void>;
}

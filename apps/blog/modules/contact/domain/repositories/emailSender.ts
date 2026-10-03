import type { Contact } from '../entities/contact';

export interface EmailSender {
  sendToVisitor(
    contact: Contact,
    subject: string,
    htmlBody: string
  ): Promise<void>;
  sendToOwner(subject: string, htmlBody: string): Promise<void>;
}

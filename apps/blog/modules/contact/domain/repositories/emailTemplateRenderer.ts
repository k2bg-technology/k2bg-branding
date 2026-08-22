import type { Contact } from '../entities/contact';

export interface EmailTemplateRenderer {
  renderOwnerNotification(contact: Contact): string;
  renderVisitorConfirmation(contact: Contact): string;
}

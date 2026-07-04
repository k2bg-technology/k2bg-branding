import type { Contact } from '../entities/contact';

export interface EmailTemplateRenderer {
  render(contact: Contact): string;
}

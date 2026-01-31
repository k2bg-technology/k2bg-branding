import type { Email, Message, Name } from '../value-objects';

/**
 * Contact domain types
 */

export interface ContactProps {
  name: Name;
  email: Email;
  message: Message;
}

export interface ContactPrimitives {
  name: string;
  email: string;
  message: string;
}

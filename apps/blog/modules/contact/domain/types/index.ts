import type { Email, Message, Name } from '../value-objects';

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

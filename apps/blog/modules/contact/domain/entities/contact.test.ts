import { describe, expect, it } from 'vitest';

import { Email } from '../value-objects/email';
import { Message } from '../value-objects/message';
import { Name } from '../value-objects/name';
import { Contact } from './contact';

describe('Contact', () => {
  describe('create', () => {
    it('creates Contact entity with valid props', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello, world!');

      const contact = Contact.create({ name, email, message });

      expect(contact.name).toBe(name);
      expect(contact.email).toBe(email);
      expect(contact.message).toBe(message);
    });
  });

  describe('toObject', () => {
    it('returns contact data as plain object', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello, world!');
      const contact = Contact.create({ name, email, message });

      const result = contact.toObject();

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, world!',
      });
    });
  });
});

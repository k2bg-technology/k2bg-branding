import { describe, expect, it } from 'vitest';

import { Email } from '../value-objects/email';
import { Message } from '../value-objects/message';
import { Name } from '../value-objects/name';
import { Contact } from './contact';

describe('Contact', () => {
  describe('create', () => {
    it('creates contact with valid props', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello, this is a test message.');

      const contact = Contact.create({ name, email, message });

      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe('Hello, this is a test message.');
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes contact from props', () => {
      const name = Name.reconstitute('John Doe');
      const email = Email.reconstitute('john@example.com');
      const message = Message.reconstitute('Hello');

      const contact = Contact.reconstitute({ name, email, message });

      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe('Hello');
    });
  });

  describe('getters', () => {
    it('returns name value object', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello');
      const contact = Contact.create({ name, email, message });

      expect(contact.name).toBe(name);
    });

    it('returns email value object', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello');
      const contact = Contact.create({ name, email, message });

      expect(contact.email).toBe(email);
    });

    it('returns message value object', () => {
      const name = Name.create('John Doe');
      const email = Email.create('john@example.com');
      const message = Message.create('Hello');
      const contact = Contact.create({ name, email, message });

      expect(contact.message).toBe(message);
    });
  });
});

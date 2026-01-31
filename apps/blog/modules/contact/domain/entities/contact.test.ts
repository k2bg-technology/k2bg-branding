import { describe, expect, it } from 'vitest';

import { InvalidEmailError, InvalidNameError } from '../errors/errors';
import { Contact } from './contact';

describe('Contact Entity', () => {
  describe('create', () => {
    it('should create a valid contact', () => {
      const contact = Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      });

      expect(contact.name.getValue()).toBe('John Doe');
      expect(contact.email.getValue()).toBe('john@example.com');
      expect(contact.message.getValue()).toBe(
        'Hello, this is a test message.'
      );
    });

    it('should throw InvalidNameError when name is invalid', () => {
      expect(() =>
        Contact.create({
          name: '',
          email: 'john@example.com',
          message: 'Hello',
        })
      ).toThrow(InvalidNameError);
    });

    it('should throw InvalidEmailError when email is invalid', () => {
      expect(() =>
        Contact.create({
          name: 'John Doe',
          email: 'invalid-email',
          message: 'Hello',
        })
      ).toThrow(InvalidEmailError);
    });
  });

  describe('toPrimitives', () => {
    it('should return primitive values', () => {
      const contact = Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });

      const primitives = contact.toPrimitives();

      expect(primitives).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });
    });
  });
});

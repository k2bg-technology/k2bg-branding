import { describe, expect, it } from 'vitest';

import { InvalidEmailError, InvalidNameError } from '../errors/errors';
import { Contact } from './contact';

describe('Contact Entity', () => {
  describe('create', () => {
    it('creates a valid contact', () => {
      const sut = Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      });

      expect(sut.name.getValue()).toBe('John Doe');
      expect(sut.email.getValue()).toBe('john@example.com');
      expect(sut.message.getValue()).toBe('Hello, this is a test message.');
    });

    it('throws InvalidNameError when name is invalid', () => {
      expect(() =>
        Contact.create({
          name: '',
          email: 'john@example.com',
          message: 'Hello',
        })
      ).toThrow(InvalidNameError);
    });

    it('throws InvalidEmailError when email is invalid', () => {
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
    it('returns primitive values', () => {
      const sut = Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });

      const primitives = sut.toPrimitives();

      expect(primitives).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });
    });
  });
});

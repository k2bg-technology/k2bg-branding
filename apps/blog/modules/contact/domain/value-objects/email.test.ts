import { describe, expect, it } from 'vitest';

import { InvalidEmailError } from '../errors/errors';
import { Email } from './email';

describe('Email', () => {
  describe('create', () => {
    it('creates Email with valid email address', () => {
      const email = Email.create('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('throws InvalidEmailError when email is empty', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });

    it('throws InvalidEmailError when email format is invalid', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailError);
    });
  });

  describe('isValid', () => {
    it('returns true for valid email', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
    });

    it('returns false for invalid email', () => {
      expect(Email.isValid('invalid')).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when emails are equal', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('returns false when emails are different', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});

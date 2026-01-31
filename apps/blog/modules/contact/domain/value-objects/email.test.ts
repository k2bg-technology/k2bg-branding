import { describe, expect, it } from 'vitest';

import { InvalidEmailError } from '../errors/errors';
import { Email } from './email';

describe('Email', () => {
  describe('create', () => {
    it('creates email with valid email address', () => {
      const email = Email.create('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('trims whitespace from email', () => {
      const email = Email.create('  test@example.com  ');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('converts email to lowercase', () => {
      const email = Email.create('Test@Example.COM');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('throws InvalidEmailError when email is empty', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('throws InvalidEmailError when email is only whitespace', () => {
      expect(() => Email.create('   ')).toThrow(InvalidEmailError);
      expect(() => Email.create('   ')).toThrow('Email cannot be empty');
    });

    it('throws InvalidEmailError when email format is invalid', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailError);
      expect(() => Email.create('invalid-email')).toThrow(
        'Invalid email format'
      );
    });

    it('throws InvalidEmailError when email is missing @', () => {
      expect(() => Email.create('testexample.com')).toThrow(InvalidEmailError);
    });

    it('throws InvalidEmailError when email is missing domain', () => {
      expect(() => Email.create('test@')).toThrow(InvalidEmailError);
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

  describe('toString', () => {
    it('returns email value as string', () => {
      const email = Email.create('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes email from string value', () => {
      const email = Email.reconstitute('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });
  });
});

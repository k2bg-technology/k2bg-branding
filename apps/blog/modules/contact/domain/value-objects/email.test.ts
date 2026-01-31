import { describe, expect, it } from 'vitest';

import { InvalidEmailError } from '../errors/errors';
import { Email } from './email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace and convert to lowercase', () => {
      const email = Email.create('  Test@Example.COM  ');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw InvalidEmailError when email is empty', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw InvalidEmailError when email is whitespace only', () => {
      expect(() => Email.create('   ')).toThrow(InvalidEmailError);
      expect(() => Email.create('   ')).toThrow('Email cannot be empty');
    });

    it('should throw InvalidEmailError when email format is invalid', () => {
      expect(() => Email.create('invalid')).toThrow(InvalidEmailError);
      expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('should throw InvalidEmailError when email is missing @', () => {
      expect(() => Email.create('testexample.com')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError when email is missing domain', () => {
      expect(() => Email.create('test@')).toThrow(InvalidEmailError);
    });
  });

  describe('equals', () => {
    it('should return true for emails with same value', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for emails with different values', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should create email without validation', () => {
      const email = Email.reconstitute('existing@example.com');

      expect(email.getValue()).toBe('existing@example.com');
    });
  });
});

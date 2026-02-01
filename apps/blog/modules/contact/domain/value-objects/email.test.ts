import { describe, expect, it } from 'vitest';

import { InvalidEmailError } from '../errors/errors';
import { Email } from './email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('creates a valid email', () => {
      const sut = Email.create('test@example.com');

      expect(sut.getValue()).toBe('test@example.com');
    });

    it('trims whitespace and converts to lowercase', () => {
      const sut = Email.create('  Test@Example.COM  ');

      expect(sut.getValue()).toBe('test@example.com');
    });

    it('throws InvalidEmailError when email is empty', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('throws InvalidEmailError when email is whitespace only', () => {
      expect(() => Email.create('   ')).toThrow(InvalidEmailError);
      expect(() => Email.create('   ')).toThrow('Email cannot be empty');
    });

    it('throws InvalidEmailError when email format is invalid', () => {
      expect(() => Email.create('invalid')).toThrow(InvalidEmailError);
      expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('throws InvalidEmailError when email is missing @', () => {
      expect(() => Email.create('testexample.com')).toThrow(InvalidEmailError);
    });

    it('throws InvalidEmailError when email is missing domain', () => {
      expect(() => Email.create('test@')).toThrow(InvalidEmailError);
    });
  });

  describe('equals', () => {
    it('returns true for emails with same value', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('returns false for emails with different values', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('creates email without validation', () => {
      const sut = Email.reconstitute('existing@example.com');

      expect(sut.getValue()).toBe('existing@example.com');
    });
  });
});

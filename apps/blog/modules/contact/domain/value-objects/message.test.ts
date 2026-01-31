import { describe, expect, it } from 'vitest';

import { InvalidMessageError } from '../errors/errors';
import { Message } from './message';

describe('Message Value Object', () => {
  describe('create', () => {
    it('creates a valid message', () => {
      const sut = Message.create('Hello, this is a test message.');

      expect(sut.getValue()).toBe('Hello, this is a test message.');
    });

    it('trims whitespace', () => {
      const sut = Message.create('  Hello World  ');

      expect(sut.getValue()).toBe('Hello World');
    });

    it('throws InvalidMessageError when message is empty', () => {
      expect(() => Message.create('')).toThrow(InvalidMessageError);
      expect(() => Message.create('')).toThrow('Message cannot be empty');
    });

    it('throws InvalidMessageError when message is whitespace only', () => {
      expect(() => Message.create('   ')).toThrow(InvalidMessageError);
      expect(() => Message.create('   ')).toThrow('Message cannot be empty');
    });

    it('throws InvalidMessageError when message exceeds max length', () => {
      const longMessage = 'a'.repeat(5001);

      expect(() => Message.create(longMessage)).toThrow(InvalidMessageError);
      expect(() => Message.create(longMessage)).toThrow(
        'Message must be 5000 characters or less'
      );
    });

    it('accepts message at max length', () => {
      const maxLengthMessage = 'a'.repeat(5000);
      const sut = Message.create(maxLengthMessage);

      expect(sut.getValue()).toBe(maxLengthMessage);
      expect(sut.getLength()).toBe(5000);
    });
  });

  describe('equals', () => {
    it('returns true for messages with same value', () => {
      const message1 = Message.create('Hello World');
      const message2 = Message.create('Hello World');

      expect(message1.equals(message2)).toBe(true);
    });

    it('returns false for messages with different values', () => {
      const message1 = Message.create('Hello');
      const message2 = Message.create('World');

      expect(message1.equals(message2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('creates message without validation', () => {
      const sut = Message.reconstitute('Existing message');

      expect(sut.getValue()).toBe('Existing message');
    });
  });
});

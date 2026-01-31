import { describe, expect, it } from 'vitest';

import { InvalidMessageError } from '../errors/errors';
import { Message } from './message';

describe('Message Value Object', () => {
  describe('create', () => {
    it('should create a valid message', () => {
      const message = Message.create('Hello, this is a test message.');

      expect(message.getValue()).toBe('Hello, this is a test message.');
    });

    it('should trim whitespace', () => {
      const message = Message.create('  Hello World  ');

      expect(message.getValue()).toBe('Hello World');
    });

    it('should throw InvalidMessageError when message is empty', () => {
      expect(() => Message.create('')).toThrow(InvalidMessageError);
      expect(() => Message.create('')).toThrow('Message cannot be empty');
    });

    it('should throw InvalidMessageError when message is whitespace only', () => {
      expect(() => Message.create('   ')).toThrow(InvalidMessageError);
      expect(() => Message.create('   ')).toThrow('Message cannot be empty');
    });

    it('should throw InvalidMessageError when message exceeds max length', () => {
      const longMessage = 'a'.repeat(5001);

      expect(() => Message.create(longMessage)).toThrow(InvalidMessageError);
      expect(() => Message.create(longMessage)).toThrow(
        'Message must be 5000 characters or less'
      );
    });

    it('should accept message at max length', () => {
      const maxLengthMessage = 'a'.repeat(5000);
      const message = Message.create(maxLengthMessage);

      expect(message.getValue()).toBe(maxLengthMessage);
      expect(message.getLength()).toBe(5000);
    });
  });

  describe('equals', () => {
    it('should return true for messages with same value', () => {
      const message1 = Message.create('Hello World');
      const message2 = Message.create('Hello World');

      expect(message1.equals(message2)).toBe(true);
    });

    it('should return false for messages with different values', () => {
      const message1 = Message.create('Hello');
      const message2 = Message.create('World');

      expect(message1.equals(message2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should create message without validation', () => {
      const message = Message.reconstitute('Existing message');

      expect(message.getValue()).toBe('Existing message');
    });
  });
});

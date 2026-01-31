import { describe, expect, it } from 'vitest';

import { InvalidMessageError } from '../errors/errors';
import { Message } from './message';

describe('Message', () => {
  describe('create', () => {
    it('creates message with valid value', () => {
      const message = Message.create('Hello, this is a test message.');

      expect(message.getValue()).toBe('Hello, this is a test message.');
    });

    it('trims whitespace from message', () => {
      const message = Message.create('  Hello, this is a test message.  ');

      expect(message.getValue()).toBe('Hello, this is a test message.');
    });

    it('throws InvalidMessageError when message is empty', () => {
      expect(() => Message.create('')).toThrow(InvalidMessageError);
      expect(() => Message.create('')).toThrow('Message cannot be empty');
    });

    it('throws InvalidMessageError when message is only whitespace', () => {
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

    it('creates message at max length', () => {
      const maxLengthMessage = 'a'.repeat(5000);
      const message = Message.create(maxLengthMessage);

      expect(message.getValue()).toBe(maxLengthMessage);
    });
  });

  describe('equals', () => {
    it('returns true when messages are equal', () => {
      const message1 = Message.create('Hello');
      const message2 = Message.create('Hello');

      expect(message1.equals(message2)).toBe(true);
    });

    it('returns false when messages are different', () => {
      const message1 = Message.create('Hello');
      const message2 = Message.create('Goodbye');

      expect(message1.equals(message2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns message value as string', () => {
      const message = Message.create('Hello');

      expect(message.toString()).toBe('Hello');
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes message from string value', () => {
      const message = Message.reconstitute('Hello');

      expect(message.getValue()).toBe('Hello');
    });
  });
});

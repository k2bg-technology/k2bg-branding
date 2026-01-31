import { describe, expect, it } from 'vitest';

import { InvalidMessageError } from '../errors/errors';
import { Message } from './message';

describe('Message', () => {
  describe('create', () => {
    it('creates Message with valid value', () => {
      const message = Message.create('Hello, world!');

      expect(message.getValue()).toBe('Hello, world!');
    });

    it('trims whitespace from message', () => {
      const message = Message.create('  Hello, world!  ');

      expect(message.getValue()).toBe('Hello, world!');
    });

    it('throws InvalidMessageError when message is empty', () => {
      expect(() => Message.create('')).toThrow(InvalidMessageError);
    });

    it('throws InvalidMessageError when message is only whitespace', () => {
      expect(() => Message.create('   ')).toThrow(InvalidMessageError);
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
      const message2 = Message.create('World');

      expect(message1.equals(message2)).toBe(false);
    });
  });
});

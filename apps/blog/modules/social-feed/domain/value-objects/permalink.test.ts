import { describe, expect, it } from 'vitest';
import { InvalidPermalinkError } from '../errors/errors';
import { Permalink } from './permalink';

describe('Permalink', () => {
  describe('create', () => {
    it('creates Permalink when given valid URL', () => {
      const url = 'https://www.instagram.com/p/ABC123/';

      const permalink = Permalink.create(url);

      expect(permalink.getValue()).toBe(url);
    });

    it('trims whitespace from value', () => {
      const url = '  https://www.instagram.com/p/ABC123/  ';

      const permalink = Permalink.create(url);

      expect(permalink.getValue()).toBe('https://www.instagram.com/p/ABC123/');
    });

    it('throws InvalidPermalinkError when value is empty', () => {
      const emptyValue = '';

      expect(() => Permalink.create(emptyValue)).toThrow(InvalidPermalinkError);
    });

    it('throws InvalidPermalinkError when value is whitespace only', () => {
      const whitespaceOnlyValue = '   ';

      expect(() => Permalink.create(whitespaceOnlyValue)).toThrow(
        InvalidPermalinkError
      );
    });

    it('throws InvalidPermalinkError when value is not valid URL', () => {
      const invalidUrl = 'not-a-url';

      expect(() => Permalink.create(invalidUrl)).toThrow(InvalidPermalinkError);
    });
  });

  describe('equals', () => {
    it('returns true when Permalinks have same value', () => {
      const link1 = Permalink.create('https://www.instagram.com/p/ABC123/');
      const link2 = Permalink.create('https://www.instagram.com/p/ABC123/');

      expect(link1.equals(link2)).toBe(true);
    });

    it('returns false when Permalinks have different values', () => {
      const link1 = Permalink.create('https://www.instagram.com/p/ABC123/');
      const link2 = Permalink.create('https://www.instagram.com/p/XYZ789/');

      expect(link1.equals(link2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns string representation of Permalink', () => {
      const url = 'https://www.instagram.com/p/ABC123/';
      const permalink = Permalink.create(url);

      expect(permalink.toString()).toBe(url);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { InvalidMediaUrlError } from '../errors/errors';
import { MediaUrl } from './mediaUrl';

describe('MediaUrl', () => {
  describe('create', () => {
    it('creates MediaUrl when given valid URL', () => {
      const url = 'https://example.com/image.jpg';

      const mediaUrl = MediaUrl.create(url);

      expect(mediaUrl.getValue()).toBe(url);
    });

    it('trims whitespace from value', () => {
      const url = '  https://example.com/image.jpg  ';

      const mediaUrl = MediaUrl.create(url);

      expect(mediaUrl.getValue()).toBe('https://example.com/image.jpg');
    });

    it('throws InvalidMediaUrlError when value is empty', () => {
      const emptyValue = '';

      expect(() => MediaUrl.create(emptyValue)).toThrow(InvalidMediaUrlError);
    });

    it('throws InvalidMediaUrlError when value is whitespace only', () => {
      const whitespaceOnlyValue = '   ';

      expect(() => MediaUrl.create(whitespaceOnlyValue)).toThrow(
        InvalidMediaUrlError
      );
    });

    it('throws InvalidMediaUrlError when value is not valid URL', () => {
      const invalidUrl = 'not-a-url';

      expect(() => MediaUrl.create(invalidUrl)).toThrow(InvalidMediaUrlError);
    });
  });

  describe('equals', () => {
    it('returns true when MediaUrls have same value', () => {
      const url1 = MediaUrl.create('https://example.com/image.jpg');
      const url2 = MediaUrl.create('https://example.com/image.jpg');

      expect(url1.equals(url2)).toBe(true);
    });

    it('returns false when MediaUrls have different values', () => {
      const url1 = MediaUrl.create('https://example.com/image1.jpg');
      const url2 = MediaUrl.create('https://example.com/image2.jpg');

      expect(url1.equals(url2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns string representation of MediaUrl', () => {
      const url = 'https://example.com/image.jpg';
      const mediaUrl = MediaUrl.create(url);

      expect(mediaUrl.toString()).toBe(url);
    });
  });
});

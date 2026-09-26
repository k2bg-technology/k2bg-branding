import { describe, expect, it } from 'vitest';

import { InvalidSourceUrlError } from '../errors/errors';

import { SourceUrl } from './sourceUrl';

describe('SourceUrl', () => {
  describe('create', () => {
    it('creates SourceUrl when given valid URL', () => {
      const validUrl = 'https://example.com/image.jpg';

      const sut = SourceUrl.create(validUrl);

      expect(sut.getValue()).toBe(validUrl);
    });

    it('throws InvalidSourceUrlError when value is empty string', () => {
      const emptyValue = '';

      expect(() => SourceUrl.create(emptyValue)).toThrow(InvalidSourceUrlError);
      expect(() => SourceUrl.create(emptyValue)).toThrow(
        'SourceUrl cannot be empty'
      );
    });

    it('throws InvalidSourceUrlError when URL format is invalid', () => {
      const invalidUrl = 'not-a-url';

      expect(() => SourceUrl.create(invalidUrl)).toThrow(InvalidSourceUrlError);
      expect(() => SourceUrl.create(invalidUrl)).toThrow('Invalid URL format');
    });
  });

  describe('reconstitute', () => {
    it('creates SourceUrl without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = SourceUrl.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal SourceUrls', () => {
      const url = 'https://example.com/image.jpg';
      const url1 = SourceUrl.create(url);
      const url2 = SourceUrl.create(url);

      const result = url1.equals(url2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different SourceUrls', () => {
      const url1 = SourceUrl.create('https://example.com/image1.jpg');
      const url2 = SourceUrl.create('https://example.com/image2.jpg');

      const result = url1.equals(url2);

      expect(result).toBe(false);
    });
  });
});

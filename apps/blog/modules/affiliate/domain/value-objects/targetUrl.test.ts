import { describe, expect, it } from 'vitest';

import { InvalidTargetUrlError } from '../errors/errors';

import { TargetUrl } from './targetUrl';

describe('TargetUrl', () => {
  describe('create', () => {
    it('creates TargetUrl when given valid HTTP URL', () => {
      const url = 'https://www.amazon.co.jp/dp/B08N5WRWNW';

      const sut = TargetUrl.create(url);

      expect(sut.getValue()).toBe(url);
    });

    it('creates TargetUrl when given valid URL with query parameters', () => {
      const url = 'https://example.com/product?id=123&ref=affiliate';

      const sut = TargetUrl.create(url);

      expect(sut.getValue()).toBe(url);
    });

    it('throws InvalidTargetUrlError when value is empty string', () => {
      const emptyValue = '';

      expect(() => TargetUrl.create(emptyValue)).toThrow(InvalidTargetUrlError);
      expect(() => TargetUrl.create(emptyValue)).toThrow(
        'TargetUrl cannot be empty'
      );
    });

    it('throws InvalidTargetUrlError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => TargetUrl.create(whitespaceValue)).toThrow(
        InvalidTargetUrlError
      );
    });

    it('throws InvalidTargetUrlError when URL format is invalid', () => {
      const invalidUrl = 'not-a-valid-url';

      expect(() => TargetUrl.create(invalidUrl)).toThrow(InvalidTargetUrlError);
      expect(() => TargetUrl.create(invalidUrl)).toThrow('Invalid URL format');
    });
  });

  describe('reconstitute', () => {
    it('creates TargetUrl without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = TargetUrl.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal TargetUrls', () => {
      const url = 'https://example.com/product';
      const url1 = TargetUrl.create(url);
      const url2 = TargetUrl.create(url);

      const result = url1.equals(url2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different TargetUrls', () => {
      const url1 = TargetUrl.create('https://example.com/product1');
      const url2 = TargetUrl.create('https://example.com/product2');

      const result = url1.equals(url2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the URL string value', () => {
      const url = 'https://example.com/product';
      const sut = TargetUrl.create(url);

      const result = sut.toString();

      expect(result).toBe(url);
    });
  });
});

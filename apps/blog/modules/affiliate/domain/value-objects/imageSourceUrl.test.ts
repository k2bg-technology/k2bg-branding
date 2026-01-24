import { describe, expect, it } from 'vitest';

import { InvalidImageSourceUrlError } from '../errors/errors';

import { ImageSourceUrl } from './imageSourceUrl';

describe('ImageSourceUrl', () => {
  describe('create', () => {
    it('creates ImageSourceUrl when given valid HTTP URL', () => {
      const url = 'https://images.example.com/product.jpg';

      const sut = ImageSourceUrl.create(url);

      expect(sut.getValue()).toBe(url);
    });

    it('creates ImageSourceUrl when given valid URL with query parameters', () => {
      const url = 'https://images.example.com/product.jpg?size=large';

      const sut = ImageSourceUrl.create(url);

      expect(sut.getValue()).toBe(url);
    });

    it('throws InvalidImageSourceUrlError when value is empty string', () => {
      const emptyValue = '';

      expect(() => ImageSourceUrl.create(emptyValue)).toThrow(
        InvalidImageSourceUrlError
      );
      expect(() => ImageSourceUrl.create(emptyValue)).toThrow(
        'ImageSourceUrl cannot be empty'
      );
    });

    it('throws InvalidImageSourceUrlError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => ImageSourceUrl.create(whitespaceValue)).toThrow(
        InvalidImageSourceUrlError
      );
    });

    it('throws InvalidImageSourceUrlError when URL format is invalid', () => {
      const invalidUrl = 'not-a-valid-url';

      expect(() => ImageSourceUrl.create(invalidUrl)).toThrow(
        InvalidImageSourceUrlError
      );
      expect(() => ImageSourceUrl.create(invalidUrl)).toThrow(
        'Invalid URL format'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ImageSourceUrl without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = ImageSourceUrl.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ImageSourceUrls', () => {
      const url = 'https://images.example.com/product.jpg';
      const url1 = ImageSourceUrl.create(url);
      const url2 = ImageSourceUrl.create(url);

      const result = url1.equals(url2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ImageSourceUrls', () => {
      const url1 = ImageSourceUrl.create(
        'https://images.example.com/product1.jpg'
      );
      const url2 = ImageSourceUrl.create(
        'https://images.example.com/product2.jpg'
      );

      const result = url1.equals(url2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the URL string value', () => {
      const url = 'https://images.example.com/product.jpg';
      const sut = ImageSourceUrl.create(url);

      const result = sut.toString();

      expect(result).toBe(url);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { InvalidImageUrlError } from '../errors/errors';
import { ImageUrl } from './imageUrl';

describe('ImageUrl', () => {
  describe('create', () => {
    it('creates ImageUrl when given valid HTTPS URL', () => {
      const validUrl = 'https://example.com/image.jpg';

      const sut = ImageUrl.create(validUrl);

      expect(sut.getValue()).toBe(validUrl);
    });

    it('trims whitespace from value', () => {
      const urlWithWhitespace = '  https://example.com/image.jpg  ';

      const sut = ImageUrl.create(urlWithWhitespace);

      const expectedValue = 'https://example.com/image.jpg';
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidImageUrlError when value is empty string', () => {
      const emptyValue = '';

      expect(() => ImageUrl.create(emptyValue)).toThrow(InvalidImageUrlError);
      expect(() => ImageUrl.create(emptyValue)).toThrow(
        'ImageUrl cannot be empty'
      );
    });

    it('throws InvalidImageUrlError when URL does not start with https://', () => {
      const httpUrl = 'http://example.com/image.jpg';

      expect(() => ImageUrl.create(httpUrl)).toThrow(InvalidImageUrlError);
      expect(() => ImageUrl.create(httpUrl)).toThrow(
        'ImageUrl must start with https://'
      );
    });

    it('throws InvalidImageUrlError when URL format is invalid', () => {
      const invalidUrl = 'https://not a valid url';

      expect(() => ImageUrl.create(invalidUrl)).toThrow(InvalidImageUrlError);
      expect(() => ImageUrl.create(invalidUrl)).toThrow('Invalid URL format');
    });

    it('throws InvalidImageUrlError when URL exceeds 2,000 characters', () => {
      const longUrl = `https://example.com/${'a'.repeat(2000)}`;

      expect(() => ImageUrl.create(longUrl)).toThrow(InvalidImageUrlError);
      expect(() => ImageUrl.create(longUrl)).toThrow(
        'ImageUrl must be 2,000 characters or less'
      );
    });

    it('creates ImageUrl when URL is exactly 2,000 characters', () => {
      const baseUrl = 'https://example.com/';
      const padding = 'a'.repeat(2000 - baseUrl.length);
      const exactUrl = baseUrl + padding;

      const sut = ImageUrl.create(exactUrl);

      const expectedLength = 2000;
      expect(sut.getValue().length).toBe(expectedLength);
    });

    it('accepts URL with query parameters', () => {
      const urlWithQuery = 'https://example.com/image.jpg?width=100&height=200';

      const sut = ImageUrl.create(urlWithQuery);

      expect(sut.getValue()).toBe(urlWithQuery);
    });

    it('accepts URL with path segments', () => {
      const urlWithPath = 'https://example.com/images/2024/01/my-image.jpg';

      const sut = ImageUrl.create(urlWithPath);

      expect(sut.getValue()).toBe(urlWithPath);
    });
  });

  describe('reconstitute', () => {
    it('creates ImageUrl without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = ImageUrl.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ImageUrls', () => {
      const urlValue = 'https://example.com/image.jpg';
      const url1 = ImageUrl.create(urlValue);
      const url2 = ImageUrl.create(urlValue);

      const result = url1.equals(url2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ImageUrls', () => {
      const url1 = ImageUrl.create('https://example.com/image1.jpg');
      const url2 = ImageUrl.create('https://example.com/image2.jpg');

      const result = url1.equals(url2);

      expect(result).toBe(false);
    });
  });
});

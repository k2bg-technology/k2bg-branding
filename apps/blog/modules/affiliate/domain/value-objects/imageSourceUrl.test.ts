import { describe, expect, it } from 'vitest';

import { InvalidImageSourceUrlError } from '../errors/errors';

import { ImageSourceUrl } from './imageSourceUrl';

describe('ImageSourceUrl', () => {
  describe('create', () => {
    it.each([
      { scenario: 'empty', value: '' },
      { scenario: 'whitespace only', value: '   ' },
    ])(
      'rejects $scenario imageSourceUrl with InvalidImageSourceUrlError',
      ({ value }) => {
        expect(() => ImageSourceUrl.create(value)).toThrow(
          InvalidImageSourceUrlError
        );
      }
    );

    it('throws InvalidImageSourceUrlError when URL format is invalid', () => {
      const invalidUrl = 'not-a-valid-url';

      expect(() => ImageSourceUrl.create(invalidUrl)).toThrow(
        InvalidImageSourceUrlError
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
});

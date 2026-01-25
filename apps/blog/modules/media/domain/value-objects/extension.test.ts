import { describe, expect, it } from 'vitest';

import { InvalidExtensionError } from '../errors/errors';

import { Extension } from './extension';

describe('Extension', () => {
  describe('create', () => {
    it('creates Extension when given valid extension without dot', () => {
      const validExtension = 'jpg';

      const sut = Extension.create(validExtension);

      expect(sut.getValue()).toBe('jpg');
    });

    it('creates Extension when given valid extension with dot', () => {
      const extensionWithDot = '.png';

      const sut = Extension.create(extensionWithDot);

      expect(sut.getValue()).toBe('png');
    });

    it('normalizes extension to lowercase', () => {
      const uppercaseExtension = 'JPG';

      const sut = Extension.create(uppercaseExtension);

      expect(sut.getValue()).toBe('jpg');
    });

    it.each([
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'mp4',
      'webm',
    ])('creates Extension for valid type: %s', (ext) => {
      const sut = Extension.create(ext);

      expect(sut.getValue()).toBe(ext);
    });

    it('throws InvalidExtensionError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Extension.create(emptyValue)).toThrow(InvalidExtensionError);
      expect(() => Extension.create(emptyValue)).toThrow(
        'Extension cannot be empty'
      );
    });

    it('throws InvalidExtensionError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => Extension.create(whitespaceValue)).toThrow(
        InvalidExtensionError
      );
    });

    it('throws InvalidExtensionError when extension is not supported', () => {
      const unsupportedExtension = 'xyz';

      expect(() => Extension.create(unsupportedExtension)).toThrow(
        InvalidExtensionError
      );
      expect(() => Extension.create(unsupportedExtension)).toThrow(
        'Invalid extension'
      );
    });
  });

  describe('fromUrl', () => {
    it('extracts extension from URL', () => {
      const url = 'https://example.com/images/photo.jpg';

      const sut = Extension.fromUrl(url);

      expect(sut.getValue()).toBe('jpg');
    });

    it('extracts extension from URL with query params', () => {
      const url = 'https://example.com/images/photo.png?width=800';

      const sut = Extension.fromUrl(url);

      expect(sut.getValue()).toBe('png');
    });

    it('extracts extension from URL with complex path', () => {
      const url = 'https://cdn.example.com/v1/uploads/2024/image.webp';

      const sut = Extension.fromUrl(url);

      expect(sut.getValue()).toBe('webp');
    });

    it('throws InvalidExtensionError when URL is empty', () => {
      const emptyUrl = '';

      expect(() => Extension.fromUrl(emptyUrl)).toThrow(InvalidExtensionError);
      expect(() => Extension.fromUrl(emptyUrl)).toThrow('URL cannot be empty');
    });

    it('throws InvalidExtensionError when URL has no extension', () => {
      const urlWithoutExtension = 'https://example.com/images/photo';

      expect(() => Extension.fromUrl(urlWithoutExtension)).toThrow(
        InvalidExtensionError
      );
      expect(() => Extension.fromUrl(urlWithoutExtension)).toThrow(
        'Cannot extract extension from URL'
      );
    });

    it('throws InvalidExtensionError when URL format is invalid', () => {
      const invalidUrl = 'not-a-url';

      expect(() => Extension.fromUrl(invalidUrl)).toThrow(
        InvalidExtensionError
      );
      expect(() => Extension.fromUrl(invalidUrl)).toThrow('Invalid URL format');
    });
  });

  describe('reconstitute', () => {
    it('creates Extension without validation', () => {
      const value = 'jpg';

      const sut = Extension.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal Extensions', () => {
      const ext = 'jpg';
      const ext1 = Extension.create(ext);
      const ext2 = Extension.create(ext);

      const result = ext1.equals(ext2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different Extensions', () => {
      const ext1 = Extension.create('jpg');
      const ext2 = Extension.create('png');

      const result = ext1.equals(ext2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the extension string value', () => {
      const ext = 'jpg';
      const sut = Extension.create(ext);

      const result = sut.toString();

      expect(result).toBe(ext);
    });
  });
});

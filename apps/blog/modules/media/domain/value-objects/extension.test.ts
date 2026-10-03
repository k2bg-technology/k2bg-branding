import { describe, expect, it } from 'vitest';

import { InvalidExtensionError } from '../errors/errors';

import { Extension } from './extension';

describe('Extension', () => {
  describe('create', () => {
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
      { name: 'JPEG short', extension: 'jpg' },
      { name: 'JPEG long', extension: 'jpeg' },
      { name: 'PNG', extension: 'png' },
      { name: 'GIF', extension: 'gif' },
      { name: 'WebP', extension: 'webp' },
      { name: 'SVG', extension: 'svg' },
      { name: 'BMP', extension: 'bmp' },
      { name: 'ICO', extension: 'ico' },
      { name: 'AVIF', extension: 'avif' },
      { name: 'MP4', extension: 'mp4' },
      { name: 'WebM', extension: 'webm' },
      { name: 'OGG', extension: 'ogg' },
      { name: 'MOV', extension: 'mov' },
      { name: 'AVI', extension: 'avi' },
    ])('accepts the supported $name extension', ({ extension }) => {
      const sut = Extension.create(extension);

      expect(sut.getValue()).toBe(extension);
    });

    it('throws InvalidExtensionError when value is empty string', () => {
      const emptyValue = '';

      expect(() => Extension.create(emptyValue)).toThrow(InvalidExtensionError);
      expect(() => Extension.create(emptyValue)).toThrow(
        'Extension cannot be empty'
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
    it.each([
      {
        format: 'a simple path',
        url: 'https://example.com/images/photo.jpg',
        expected: 'jpg',
      },
      {
        format: 'query parameters',
        url: 'https://example.com/images/photo.png?width=800',
        expected: 'png',
      },
    ])('extracts $expected from a URL with $format', ({ url, expected }) => {
      const sut = Extension.fromUrl(url);

      expect(sut.getValue()).toBe(expected);
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
});

import { describe, expect, it } from 'vitest';

import { InvalidSourceFileError } from '../errors/errors';

import { SourceFile } from './sourceFile';

describe('SourceFile', () => {
  describe('create', () => {
    it('creates SourceFile when given valid file path', () => {
      const validPath = '/uploads/image.jpg';

      const sut = SourceFile.create(validPath);

      expect(sut.getValue()).toBe(validPath);
    });

    it('trims whitespace from file path', () => {
      const pathWithWhitespace = '  /uploads/image.jpg  ';

      const sut = SourceFile.create(pathWithWhitespace);

      expect(sut.getValue()).toBe('/uploads/image.jpg');
    });

    it('throws InvalidSourceFileError when value is empty string', () => {
      const emptyValue = '';

      expect(() => SourceFile.create(emptyValue)).toThrow(
        InvalidSourceFileError
      );
      expect(() => SourceFile.create(emptyValue)).toThrow(
        'SourceFile cannot be empty'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates SourceFile without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = SourceFile.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal SourceFiles', () => {
      const path = '/uploads/image.jpg';
      const file1 = SourceFile.create(path);
      const file2 = SourceFile.create(path);

      const result = file1.equals(file2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different SourceFiles', () => {
      const file1 = SourceFile.create('/uploads/image1.jpg');
      const file2 = SourceFile.create('/uploads/image2.jpg');

      const result = file1.equals(file2);

      expect(result).toBe(false);
    });
  });
});

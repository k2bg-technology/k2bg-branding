import { describe, expect, it } from 'vitest';
import { InvalidPostIdError } from '../errors/errors';
import { PostId } from './postId';

describe('PostId', () => {
  describe('create', () => {
    it('creates PostId when given valid string', () => {
      const id = '12345678901234567';

      const postId = PostId.create(id);

      expect(postId.getValue()).toBe(id);
    });

    it('trims whitespace from value', () => {
      const id = '  12345678901234567  ';

      const postId = PostId.create(id);

      expect(postId.getValue()).toBe('12345678901234567');
    });

    it('throws InvalidPostIdError when value is empty', () => {
      const emptyValue = '';

      expect(() => PostId.create(emptyValue)).toThrow(InvalidPostIdError);
    });

    it('throws InvalidPostIdError when value is whitespace only', () => {
      const whitespaceOnlyValue = '   ';

      expect(() => PostId.create(whitespaceOnlyValue)).toThrow(
        InvalidPostIdError
      );
    });
  });

  describe('equals', () => {
    it('returns true when PostIds have same value', () => {
      const postId1 = PostId.create('12345');
      const postId2 = PostId.create('12345');

      expect(postId1.equals(postId2)).toBe(true);
    });

    it('returns false when PostIds have different values', () => {
      const postId1 = PostId.create('12345');
      const postId2 = PostId.create('67890');

      expect(postId1.equals(postId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns string representation of PostId', () => {
      const id = '12345678901234567';
      const postId = PostId.create(id);

      expect(postId.toString()).toBe(id);
    });
  });
});

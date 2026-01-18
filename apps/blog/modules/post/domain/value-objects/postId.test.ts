import { describe, expect, it } from 'vitest';
import { InvalidPostIdError } from '../errors/errors';
import { PostId } from './postId';

describe('PostId', () => {
  describe('create', () => {
    it('creates PostId when given valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const sut = PostId.create(validUuid);

      expect(sut.getValue()).toBe(validUuid.toLowerCase());
    });

    it('normalizes UUID to lowercase', () => {
      const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';

      const sut = PostId.create(uppercaseUuid);

      const expectedValue = uppercaseUuid.toLowerCase();
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidPostIdError when value is empty string', () => {
      const emptyValue = '';

      expect(() => PostId.create(emptyValue)).toThrow(InvalidPostIdError);
      expect(() => PostId.create(emptyValue)).toThrow('PostId cannot be empty');
    });

    it('throws InvalidPostIdError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => PostId.create(whitespaceValue)).toThrow(InvalidPostIdError);
    });

    it('throws InvalidPostIdError when UUID format is invalid', () => {
      const invalidUuid = 'not-a-uuid';

      expect(() => PostId.create(invalidUuid)).toThrow(InvalidPostIdError);
      expect(() => PostId.create(invalidUuid)).toThrow(
        'Invalid UUID v4 format'
      );
    });

    it('throws InvalidPostIdError when UUID version is not 4', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';

      expect(() => PostId.create(uuidV1)).toThrow(InvalidPostIdError);
    });
  });

  describe('generate', () => {
    it('generates valid UUID v4', () => {
      const sut = PostId.generate();

      const uuidPattern =
        /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
      expect(sut.getValue()).toMatch(uuidPattern);
    });

    it('generates unique IDs on each call', () => {
      const id1 = PostId.generate();
      const id2 = PostId.generate();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('reconstitute', () => {
    it('creates PostId without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = PostId.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal PostIds', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = PostId.create(uuid);
      const id2 = PostId.create(uuid);

      const result = id1.equals(id2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different PostIds', () => {
      const id1 = PostId.generate();
      const id2 = PostId.generate();

      const result = id1.equals(id2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the UUID string value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sut = PostId.create(uuid);

      const result = sut.toString();

      expect(result).toBe(uuid);
    });
  });
});

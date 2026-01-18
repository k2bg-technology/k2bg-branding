import { describe, expect, it } from 'vitest';
import { InvalidAuthorIdError } from '../errors/errors';
import { AuthorId } from './authorId';

describe('AuthorId', () => {
  describe('create', () => {
    it('creates AuthorId when given valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const sut = AuthorId.create(validUuid);

      expect(sut.getValue()).toBe(validUuid.toLowerCase());
    });

    it('normalizes UUID to lowercase', () => {
      const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';

      const sut = AuthorId.create(uppercaseUuid);

      const expectedValue = uppercaseUuid.toLowerCase();
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidAuthorIdError when value is empty string', () => {
      const emptyValue = '';

      expect(() => AuthorId.create(emptyValue)).toThrow(InvalidAuthorIdError);
      expect(() => AuthorId.create(emptyValue)).toThrow(
        'AuthorId cannot be empty'
      );
    });

    it('throws InvalidAuthorIdError when UUID format is invalid', () => {
      const invalidUuid = 'not-a-uuid';

      expect(() => AuthorId.create(invalidUuid)).toThrow(InvalidAuthorIdError);
      expect(() => AuthorId.create(invalidUuid)).toThrow(
        'Invalid UUID v4 format'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates AuthorId without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = AuthorId.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal AuthorIds', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = AuthorId.create(uuid);
      const id2 = AuthorId.create(uuid);

      const result = id1.equals(id2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different AuthorIds', () => {
      const id1 = AuthorId.create('550e8400-e29b-41d4-a716-446655440000');
      const id2 = AuthorId.create('660e8400-e29b-41d4-a716-446655440000');

      const result = id1.equals(id2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the UUID string value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sut = AuthorId.create(uuid);

      const result = sut.toString();

      expect(result).toBe(uuid);
    });
  });
});

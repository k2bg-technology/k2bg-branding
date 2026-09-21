import { describe, expect, it } from 'vitest';
import { InvalidAuthorIdError } from '../errors/errors';
import { AuthorId } from './authorId';

describe('AuthorId', () => {
  describe('create', () => {
    it.each([
      { version: 'v4', value: '550e8400-e29b-41d4-a716-446655440000' },
      { version: 'v7', value: '019234f8-7e01-7abc-89ab-0123456789ab' },
      {
        version: 'v8 (Notion format)',
        value: '26663820-64ba-8034-a128-d5dd352ef273',
      },
    ])('accepts a valid UUID $version', ({ value }) => {
      const sut = AuthorId.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('normalizes UUID to lowercase', () => {
      const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';

      const sut = AuthorId.create(uppercaseUuid);

      const expectedValue = '550e8400-e29b-41d4-a716-446655440000';
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
      expect(() => AuthorId.create(invalidUuid)).toThrow('Invalid UUID format');
    });

    it('throws InvalidAuthorIdError when UUID version is not supported (v1)', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';

      expect(() => AuthorId.create(uuidV1)).toThrow(InvalidAuthorIdError);
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

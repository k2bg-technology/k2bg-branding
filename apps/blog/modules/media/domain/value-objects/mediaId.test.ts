import { describe, expect, it } from 'vitest';

import { InvalidMediaIdError } from '../errors/errors';

import { MediaId } from './mediaId';

describe('MediaId', () => {
  describe('create', () => {
    it.each([
      { version: 'v4', value: '550e8400-e29b-41d4-a716-446655440000' },
      { version: 'v7', value: '019234f8-7e01-7abc-89ab-0123456789ab' },
      {
        version: 'v8 (Notion format)',
        value: '26663820-64ba-8034-a128-d5dd352ef273',
      },
    ])('accepts a valid UUID $version', ({ value }) => {
      const sut = MediaId.create(value);

      expect(sut.getValue()).toBe(value);
    });

    it('normalizes UUID to lowercase', () => {
      const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';

      const sut = MediaId.create(uppercaseUuid);

      const expectedValue = '550e8400-e29b-41d4-a716-446655440000';
      expect(sut.getValue()).toBe(expectedValue);
    });

    it('throws InvalidMediaIdError when value is empty string', () => {
      const emptyValue = '';

      expect(() => MediaId.create(emptyValue)).toThrow(InvalidMediaIdError);
      expect(() => MediaId.create(emptyValue)).toThrow(
        'MediaId cannot be empty'
      );
    });

    it('throws InvalidMediaIdError when value is whitespace only', () => {
      const whitespaceValue = '   ';

      expect(() => MediaId.create(whitespaceValue)).toThrow(
        InvalidMediaIdError
      );
    });

    it('throws InvalidMediaIdError when UUID format is invalid', () => {
      const invalidUuid = 'not-a-uuid';

      expect(() => MediaId.create(invalidUuid)).toThrow(InvalidMediaIdError);
      expect(() => MediaId.create(invalidUuid)).toThrow('Invalid UUID format');
    });

    it('throws InvalidMediaIdError when UUID version is not supported (v1)', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';

      expect(() => MediaId.create(uuidV1)).toThrow(InvalidMediaIdError);
    });
  });

  describe('generate', () => {
    it('generates valid UUID v4', () => {
      const sut = MediaId.generate();

      const uuidPattern =
        /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
      expect(sut.getValue()).toMatch(uuidPattern);
    });

    it('generates unique IDs on each call', () => {
      const id1 = MediaId.generate();
      const id2 = MediaId.generate();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('reconstitute', () => {
    it('creates MediaId without validation', () => {
      const value = 'any-value-from-persistence';

      const sut = MediaId.reconstitute(value);

      expect(sut.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal MediaIds', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = MediaId.create(uuid);
      const id2 = MediaId.create(uuid);

      const result = id1.equals(id2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different MediaIds', () => {
      const id1 = MediaId.generate();
      const id2 = MediaId.generate();

      const result = id1.equals(id2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the UUID string value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sut = MediaId.create(uuid);

      const result = sut.toString();

      expect(result).toBe(uuid);
    });
  });
});

import { describe, expect, it } from 'vitest';

import { InvalidSubProviderIdsError } from '../errors/errors';

import { SubProviderIds } from './subProviderIds';

describe('SubProviderIds', () => {
  describe('create', () => {
    it('creates SubProviderIds when given valid UUID array', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '660f9500-f30c-42e5-b827-557766551111',
      ];

      const sut = SubProviderIds.create(ids);

      expect(sut.getValues()).toEqual(ids.map((id) => id.toLowerCase()));
    });

    it('creates SubProviderIds with empty array', () => {
      const ids: string[] = [];

      const sut = SubProviderIds.create(ids);

      expect(sut.getValues()).toEqual([]);
      expect(sut.isEmpty()).toBe(true);
    });

    it('normalizes UUIDs to lowercase', () => {
      const ids = ['550E8400-E29B-41D4-A716-446655440000'];

      const sut = SubProviderIds.create(ids);

      expect(sut.getValues()).toEqual(['550e8400-e29b-41d4-a716-446655440000']);
    });

    it('removes duplicate IDs', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      const sut = SubProviderIds.create(ids);

      expect(sut.count()).toBe(1);
    });

    it('throws InvalidSubProviderIdsError when UUID format is invalid', () => {
      const ids = ['not-a-valid-uuid'];

      expect(() => SubProviderIds.create(ids)).toThrow(
        InvalidSubProviderIdsError
      );
      expect(() => SubProviderIds.create(ids)).toThrow(
        'Invalid UUID format in SubProviderIds'
      );
    });

    it('throws InvalidSubProviderIdsError when array contains mixed valid and invalid UUIDs', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        'invalid-uuid',
      ];

      expect(() => SubProviderIds.create(ids)).toThrow(
        InvalidSubProviderIdsError
      );
    });
  });

  describe('empty', () => {
    it('creates empty SubProviderIds', () => {
      const sut = SubProviderIds.empty();

      expect(sut.isEmpty()).toBe(true);
      expect(sut.count()).toBe(0);
    });
  });

  describe('reconstitute', () => {
    it('creates SubProviderIds without validation', () => {
      const values = ['any-value-from-persistence'];

      const sut = SubProviderIds.reconstitute(values);

      expect(sut.getValues()).toEqual(values);
    });
  });

  describe('isEmpty', () => {
    it('returns true when array is empty', () => {
      const sut = SubProviderIds.create([]);

      expect(sut.isEmpty()).toBe(true);
    });

    it('returns false when array has elements', () => {
      const sut = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
      ]);

      expect(sut.isEmpty()).toBe(false);
    });
  });

  describe('count', () => {
    it('returns the number of IDs', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '660f9500-f30c-42e5-b827-557766551111',
      ];

      const sut = SubProviderIds.create(ids);

      expect(sut.count()).toBe(2);
    });
  });

  describe('contains', () => {
    it('returns true when ID exists', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const sut = SubProviderIds.create([id]);

      expect(sut.contains(id)).toBe(true);
    });

    it('returns true when ID exists with different case', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const sut = SubProviderIds.create([id]);

      expect(sut.contains(id.toUpperCase())).toBe(true);
    });

    it('returns false when ID does not exist', () => {
      const sut = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
      ]);

      expect(sut.contains('660f9500-f30c-42e5-b827-557766551111')).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal SubProviderIds', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '660f9500-f30c-42e5-b827-557766551111',
      ];
      const ids1 = SubProviderIds.create(ids);
      const ids2 = SubProviderIds.create(ids);

      const result = ids1.equals(ids2);

      expect(result).toBe(true);
    });

    it('returns true when comparing same IDs in different order', () => {
      const ids1 = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
        '660f9500-f30c-42e5-b827-557766551111',
      ]);
      const ids2 = SubProviderIds.create([
        '660f9500-f30c-42e5-b827-557766551111',
        '550e8400-e29b-41d4-a716-446655440000',
      ]);

      const result = ids1.equals(ids2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different SubProviderIds', () => {
      const ids1 = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
      ]);
      const ids2 = SubProviderIds.create([
        '660f9500-f30c-42e5-b827-557766551111',
      ]);

      const result = ids1.equals(ids2);

      expect(result).toBe(false);
    });

    it('returns false when comparing SubProviderIds with different lengths', () => {
      const ids1 = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
      ]);
      const ids2 = SubProviderIds.create([
        '550e8400-e29b-41d4-a716-446655440000',
        '660f9500-f30c-42e5-b827-557766551111',
      ]);

      const result = ids1.equals(ids2);

      expect(result).toBe(false);
    });
  });
});

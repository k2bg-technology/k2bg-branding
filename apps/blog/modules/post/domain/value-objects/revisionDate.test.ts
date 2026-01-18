import { describe, expect, it } from 'vitest';
import { InvalidRevisionDateError } from '../errors/errors';
import { ReleaseDate } from './releaseDate';
import { RevisionDate } from './revisionDate';

describe('RevisionDate', () => {
  describe('create', () => {
    it('creates RevisionDate when given valid Date object', () => {
      const validDate = new Date('2024-01-15');

      const sut = RevisionDate.create(validDate);

      expect(sut.toISOString()).toBe('2024-01-15');
    });

    it('creates RevisionDate when given valid date string', () => {
      const validDateString = '2024-01-15';

      const sut = RevisionDate.create(validDateString);

      expect(sut.toISOString()).toBe('2024-01-15');
    });

    it('throws InvalidRevisionDateError when given invalid date string', () => {
      const invalidDateString = 'not-a-date';

      expect(() => RevisionDate.create(invalidDateString)).toThrow(
        InvalidRevisionDateError
      );
      expect(() => RevisionDate.create(invalidDateString)).toThrow(
        'Invalid date format'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates RevisionDate without validation', () => {
      const dateString = '2024-01-15';

      const sut = RevisionDate.reconstitute(dateString);

      expect(sut.toISOString()).toBe('2024-01-15');
    });
  });

  describe('getValue', () => {
    it('returns a copy of the date', () => {
      const originalDate = new Date('2024-01-15');
      const sut = RevisionDate.create(originalDate);

      const result = sut.getValue();
      result.setFullYear(2025);

      expect(sut.toISOString()).toBe('2024-01-15');
    });
  });

  describe('toISOString', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T12:30:45Z');
      const sut = RevisionDate.create(date);

      const result = sut.toISOString();

      expect(result).toBe('2024-01-15');
    });
  });

  describe('isOnOrAfter', () => {
    it('returns true when revision date is after release date', () => {
      const releaseDate = ReleaseDate.create('2024-01-15');
      const sut = RevisionDate.create('2024-01-20');

      const result = sut.isOnOrAfter(releaseDate);

      expect(result).toBe(true);
    });

    it('returns true when revision date equals release date', () => {
      const releaseDate = ReleaseDate.create('2024-01-15');
      const sut = RevisionDate.create('2024-01-15');

      const result = sut.isOnOrAfter(releaseDate);

      expect(result).toBe(true);
    });

    it('returns false when revision date is before release date', () => {
      const releaseDate = ReleaseDate.create('2024-01-15');
      const sut = RevisionDate.create('2024-01-10');

      const result = sut.isOnOrAfter(releaseDate);

      expect(result).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal RevisionDates', () => {
      const date1 = RevisionDate.create('2024-01-15');
      const date2 = RevisionDate.create('2024-01-15');

      const result = date1.equals(date2);

      expect(result).toBe(true);
    });

    it('returns true when dates have different times but same day', () => {
      const date1 = RevisionDate.create(new Date('2024-01-15T10:00:00Z'));
      const date2 = RevisionDate.create(new Date('2024-01-15T20:00:00Z'));

      const result = date1.equals(date2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different RevisionDates', () => {
      const date1 = RevisionDate.create('2024-01-15');
      const date2 = RevisionDate.create('2024-01-16');

      const result = date1.equals(date2);

      expect(result).toBe(false);
    });
  });
});

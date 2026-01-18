import { afterEach, describe, expect, it, vi } from 'vitest';
import { InvalidReleaseDateError } from '../errors/errors';
import { ReleaseDate } from './releaseDate';

describe('ReleaseDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('creates ReleaseDate when given valid Date object', () => {
      const validDate = new Date('2024-01-15');

      const sut = ReleaseDate.create(validDate);

      expect(sut.toISOString()).toBe('2024-01-15');
    });

    it('creates ReleaseDate when given valid date string', () => {
      const validDateString = '2024-01-15';

      const sut = ReleaseDate.create(validDateString);

      expect(sut.toISOString()).toBe('2024-01-15');
    });

    it('throws InvalidReleaseDateError when given invalid date string', () => {
      const invalidDateString = 'not-a-date';

      expect(() => ReleaseDate.create(invalidDateString)).toThrow(
        InvalidReleaseDateError
      );
      expect(() => ReleaseDate.create(invalidDateString)).toThrow(
        'Invalid date format'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates ReleaseDate without validation', () => {
      const dateString = '2024-01-15';

      const sut = ReleaseDate.reconstitute(dateString);

      expect(sut.toISOString()).toBe('2024-01-15');
    });
  });

  describe('getValue', () => {
    it('returns a copy of the date', () => {
      const originalDate = new Date('2024-01-15');
      const sut = ReleaseDate.create(originalDate);

      const result = sut.getValue();
      result.setFullYear(2025);

      expect(sut.toISOString()).toBe('2024-01-15');
    });
  });

  describe('toISOString', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T12:30:45Z');
      const sut = ReleaseDate.create(date);

      const result = sut.toISOString();

      expect(result).toBe('2024-01-15');
    });
  });

  describe('isFutureDate', () => {
    it('returns true when date is in the future', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const futureDate = new Date('2024-01-16');
      const sut = ReleaseDate.create(futureDate);

      const result = sut.isFutureDate();

      expect(result).toBe(true);
    });

    it('returns false when date is today', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const today = new Date('2024-01-15');
      const sut = ReleaseDate.create(today);

      const result = sut.isFutureDate();

      expect(result).toBe(false);
    });

    it('returns false when date is in the past', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const pastDate = new Date('2024-01-14');
      const sut = ReleaseDate.create(pastDate);

      const result = sut.isFutureDate();

      expect(result).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when comparing equal ReleaseDates', () => {
      const date1 = ReleaseDate.create('2024-01-15');
      const date2 = ReleaseDate.create('2024-01-15');

      const result = date1.equals(date2);

      expect(result).toBe(true);
    });

    it('returns true when dates have different times but same day', () => {
      const date1 = ReleaseDate.create(new Date('2024-01-15T10:00:00Z'));
      const date2 = ReleaseDate.create(new Date('2024-01-15T20:00:00Z'));

      const result = date1.equals(date2);

      expect(result).toBe(true);
    });

    it('returns false when comparing different ReleaseDates', () => {
      const date1 = ReleaseDate.create('2024-01-15');
      const date2 = ReleaseDate.create('2024-01-16');

      const result = date1.equals(date2);

      expect(result).toBe(false);
    });
  });
});

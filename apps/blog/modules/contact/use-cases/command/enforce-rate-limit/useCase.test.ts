import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContactSubmissionRepository } from '../../../domain';
import { ContactRateLimitExceededError } from '../../shared';
import { EnforceContactRateLimit } from './useCase';

const FIXED_NOW = new Date('2026-07-04T12:00:00.000Z');
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

function createMockContactSubmissionRepository(): ContactSubmissionRepository {
  return {
    recordIfUnderLimit: vi.fn().mockResolvedValue(true),
  };
}

describe('EnforceContactRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execute', () => {
    it('records the submission atomically with the hourly window and limit', async () => {
      const repository = createMockContactSubmissionRepository();
      const sut = new EnforceContactRateLimit(repository);
      const ipHash = 'hashed-client-ip';

      await sut.execute({ ipHash });

      const expectedSince = new Date(FIXED_NOW.getTime() - ONE_HOUR_IN_MS);
      expect(repository.recordIfUnderLimit).toHaveBeenCalledWith(
        ipHash,
        expectedSince,
        RATE_LIMIT_MAX_SUBMISSIONS
      );
    });

    it('resolves when the repository records the submission', async () => {
      const repository = createMockContactSubmissionRepository();
      vi.mocked(repository.recordIfUnderLimit).mockResolvedValue(true);
      const sut = new EnforceContactRateLimit(repository);

      await expect(
        sut.execute({ ipHash: 'hashed-client-ip' })
      ).resolves.toBeUndefined();
    });

    it('throws when the repository reports the limit is reached', async () => {
      const repository = createMockContactSubmissionRepository();
      vi.mocked(repository.recordIfUnderLimit).mockResolvedValue(false);
      const sut = new EnforceContactRateLimit(repository);

      await expect(sut.execute({ ipHash: 'hashed-client-ip' })).rejects.toThrow(
        ContactRateLimitExceededError
      );
    });
  });
});

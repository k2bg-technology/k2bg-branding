import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContactSubmissionRepository } from '../../../domain';
import { ContactRateLimitExceededError } from '../../shared';
import { EnforceContactRateLimit } from './useCase';

const FIXED_NOW = new Date('2026-07-04T12:00:00.000Z');
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

function createMockContactSubmissionRepository(): ContactSubmissionRepository {
  return {
    countSince: vi.fn().mockResolvedValue(0),
    record: vi.fn().mockResolvedValue(undefined),
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
    it('records the submission when the IP hash is under the limit', async () => {
      const repository = createMockContactSubmissionRepository();
      const underLimitSubmissionCount = RATE_LIMIT_MAX_SUBMISSIONS - 1;
      vi.mocked(repository.countSince).mockResolvedValue(
        underLimitSubmissionCount
      );
      const sut = new EnforceContactRateLimit(repository);
      const ipHash = 'hashed-client-ip';

      await sut.execute({ ipHash });

      const expectedSince = new Date(FIXED_NOW.getTime() - ONE_HOUR_IN_MS);
      expect(repository.countSince).toHaveBeenCalledWith(ipHash, expectedSince);
      expect(repository.record).toHaveBeenCalledWith(ipHash);
    });

    it.each`
      submissionCount
      ${RATE_LIMIT_MAX_SUBMISSIONS}
      ${RATE_LIMIT_MAX_SUBMISSIONS + 1}
    `(
      'throws without recording when submission count is $submissionCount',
      async ({ submissionCount }: { submissionCount: number }) => {
        const repository = createMockContactSubmissionRepository();
        vi.mocked(repository.countSince).mockResolvedValue(submissionCount);
        const sut = new EnforceContactRateLimit(repository);
        const ipHash = 'hashed-client-ip';

        await expect(sut.execute({ ipHash })).rejects.toThrow(
          ContactRateLimitExceededError
        );

        expect(repository.record).not.toHaveBeenCalled();
      }
    );
  });
});

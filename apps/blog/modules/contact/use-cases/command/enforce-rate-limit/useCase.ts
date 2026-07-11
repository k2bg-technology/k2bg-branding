import type { ContactSubmissionRepository } from '../../../domain';
import { ContactRateLimitExceededError } from '../../shared';

export interface EnforceContactRateLimitInput {
  ipHash: string;
}

const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export class EnforceContactRateLimit {
  constructor(
    private readonly contactSubmissionRepository: ContactSubmissionRepository
  ) {}

  async execute(input: EnforceContactRateLimitInput): Promise<void> {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    // Check-and-record must be one atomic repository operation; a separate
    // count + insert lets concurrent submissions all pass the check together.
    const recorded = await this.contactSubmissionRepository.recordIfUnderLimit(
      input.ipHash,
      since,
      RATE_LIMIT_MAX_SUBMISSIONS
    );

    if (!recorded) {
      throw new ContactRateLimitExceededError();
    }
  }
}

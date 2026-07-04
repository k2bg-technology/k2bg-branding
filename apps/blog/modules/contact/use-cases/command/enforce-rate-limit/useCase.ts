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
    const submissionCount = await this.contactSubmissionRepository.countSince(
      input.ipHash,
      since
    );

    if (submissionCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
      throw new ContactRateLimitExceededError();
    }

    await this.contactSubmissionRepository.record(input.ipHash);
  }
}

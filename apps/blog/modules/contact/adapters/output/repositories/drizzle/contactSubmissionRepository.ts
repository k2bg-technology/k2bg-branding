import { and, count, eq, gte, lt } from 'drizzle-orm';

import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import { contactSubmissions } from '../../../../../../infrastructure/drizzle/schema';
import type { ContactSubmissionRepository } from '../../../../domain';
import { RepositoryError } from '../../../shared';

const SUBMISSION_RETENTION_MS = 24 * 60 * 60 * 1000;

export class DrizzleContactSubmissionRepository
  implements ContactSubmissionRepository
{
  constructor(private readonly db: DrizzleClient) {}

  async countSince(ipHash: string, since: Date): Promise<number> {
    try {
      const [result] = await this.db
        .select({ value: count() })
        .from(contactSubmissions)
        .where(
          and(
            eq(contactSubmissions.ipHash, ipHash),
            gte(contactSubmissions.createdAt, since)
          )
        );

      return result.value;
    } catch (error) {
      throw new RepositoryError(
        `Failed to count contact submissions for IP hash: ${ipHash}`,
        error
      );
    }
  }

  async record(ipHash: string): Promise<void> {
    const retentionCutoff = new Date(Date.now() - SUBMISSION_RETENTION_MS);

    try {
      await this.db
        .delete(contactSubmissions)
        .where(lt(contactSubmissions.createdAt, retentionCutoff));
      await this.db.insert(contactSubmissions).values({ ipHash });
    } catch (error) {
      throw new RepositoryError(
        `Failed to record contact submission for IP hash: ${ipHash}`,
        error
      );
    }
  }
}

import { and, count, eq, gte, lt, sql } from 'drizzle-orm';

import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import { contactSubmissions } from '../../../../../../infrastructure/drizzle/schema';
import type { ContactSubmissionRepository } from '../../../../domain';
import { RepositoryError } from '../../../shared';

const SUBMISSION_RETENTION_MS = 24 * 60 * 60 * 1000;
// Namespaces the per-IP advisory lock so it cannot collide with other
// advisory-lock users in the same database.
const ADVISORY_LOCK_NAMESPACE = 'contact_submissions';

export class DrizzleContactSubmissionRepository
  implements ContactSubmissionRepository
{
  constructor(private readonly db: DrizzleClient) {}

  async recordIfUnderLimit(
    ipHash: string,
    since: Date,
    maxSubmissions: number
  ): Promise<boolean> {
    const retentionCutoff = new Date(Date.now() - SUBMISSION_RETENTION_MS);

    try {
      return await this.db.transaction(async (tx) => {
        // Serialize concurrent submissions per IP hash: under READ COMMITTED
        // a plain count cannot see other in-flight inserts, so a burst of
        // simultaneous requests would all pass the limit check together. The
        // xact-scoped lock is released automatically on commit/rollback.
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_NAMESPACE}), hashtext(${ipHash}))`
        );

        const [result] = await tx
          .select({ value: count() })
          .from(contactSubmissions)
          .where(
            and(
              eq(contactSubmissions.ipHash, ipHash),
              gte(contactSubmissions.createdAt, since)
            )
          );

        if (result.value >= maxSubmissions) {
          return false;
        }

        await tx
          .delete(contactSubmissions)
          .where(lt(contactSubmissions.createdAt, retentionCutoff));
        await tx.insert(contactSubmissions).values({ ipHash });

        return true;
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to record contact submission for IP hash: ${ipHash}`,
        error
      );
    }
  }
}

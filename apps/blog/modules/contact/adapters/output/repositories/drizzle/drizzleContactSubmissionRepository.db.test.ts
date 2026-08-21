import { count, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { contactSubmissions } from '../../../../../../infrastructure/drizzle/schema';
import {
  getTestDb,
  truncateAllTables,
} from '../../../../../post/adapters/shared/testing/testDatabase';
import { DrizzleContactSubmissionRepository } from './contactSubmissionRepository';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const TWO_HOURS_IN_MS = 2 * ONE_HOUR_IN_MS;
const TWENTY_FIVE_HOURS_IN_MS = 25 * ONE_HOUR_IN_MS;
const TWENTY_THREE_HOURS_IN_MS = 23 * ONE_HOUR_IN_MS;
const MAX_SUBMISSIONS = 5;

async function countSubmissionsFor(ipHash: string): Promise<number> {
  const [result] = await getTestDb()
    .select({ value: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.ipHash, ipHash));

  return result.value;
}

function createSubmissionRows(
  ipHash: string,
  amount: number,
  createdAt: Date
): { ipHash: string; createdAt: Date }[] {
  return Array.from({ length: amount }, () => ({ ipHash, createdAt }));
}

describe('DrizzleContactSubmissionRepository', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  describe('recordIfUnderLimit', () => {
    it('records the submission and returns true when the IP hash is under the limit', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const since = new Date(Date.now() - ONE_HOUR_IN_MS);
      await db
        .insert(contactSubmissions)
        .values(createSubmissionRows(ipHash, MAX_SUBMISSIONS - 1, new Date()));

      const result = await sut.recordIfUnderLimit(
        ipHash,
        since,
        MAX_SUBMISSIONS
      );

      expect(result).toBe(true);
      await expect(countSubmissionsFor(ipHash)).resolves.toBe(MAX_SUBMISSIONS);
    });

    it('returns false without recording when the IP hash reached the limit', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const since = new Date(Date.now() - ONE_HOUR_IN_MS);
      await db
        .insert(contactSubmissions)
        .values(createSubmissionRows(ipHash, MAX_SUBMISSIONS, new Date()));

      const result = await sut.recordIfUnderLimit(
        ipHash,
        since,
        MAX_SUBMISSIONS
      );

      expect(result).toBe(false);
      await expect(countSubmissionsFor(ipHash)).resolves.toBe(MAX_SUBMISSIONS);
    });

    it('ignores submissions outside the window and from other IP hashes', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const otherIpHash = 'other-ip-hash';
      const since = new Date(Date.now() - ONE_HOUR_IN_MS);
      const beforeWindow = new Date(Date.now() - TWO_HOURS_IN_MS);
      await db
        .insert(contactSubmissions)
        .values([
          ...createSubmissionRows(ipHash, MAX_SUBMISSIONS, beforeWindow),
          ...createSubmissionRows(otherIpHash, MAX_SUBMISSIONS, new Date()),
        ]);

      const result = await sut.recordIfUnderLimit(
        ipHash,
        since,
        MAX_SUBMISSIONS
      );

      expect(result).toBe(true);
    });

    it('prunes submissions older than twenty four hours when recording', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const oldIpHash = 'old-ip-hash';
      const recentIpHash = 'recent-ip-hash';
      const since = new Date(Date.now() - ONE_HOUR_IN_MS);
      await db.insert(contactSubmissions).values([
        {
          ipHash: oldIpHash,
          createdAt: new Date(Date.now() - TWENTY_FIVE_HOURS_IN_MS),
        },
        {
          ipHash: recentIpHash,
          createdAt: new Date(Date.now() - TWENTY_THREE_HOURS_IN_MS),
        },
      ]);

      await sut.recordIfUnderLimit(ipHash, since, MAX_SUBMISSIONS);

      const expectedOldSubmissionCount = 0;
      const expectedRecentSubmissionCount = 1;
      const expectedNewSubmissionCount = 1;
      await expect(countSubmissionsFor(oldIpHash)).resolves.toBe(
        expectedOldSubmissionCount
      );
      await expect(countSubmissionsFor(recentIpHash)).resolves.toBe(
        expectedRecentSubmissionCount
      );
      await expect(countSubmissionsFor(ipHash)).resolves.toBe(
        expectedNewSubmissionCount
      );
    });

    it('allows only the remaining quota when submissions arrive concurrently', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const since = new Date(Date.now() - ONE_HOUR_IN_MS);
      const concurrentAttempts = MAX_SUBMISSIONS;
      await db
        .insert(contactSubmissions)
        .values(createSubmissionRows(ipHash, MAX_SUBMISSIONS - 1, new Date()));

      const results = await Promise.all(
        Array.from({ length: concurrentAttempts }, () =>
          sut.recordIfUnderLimit(ipHash, since, MAX_SUBMISSIONS)
        )
      );

      const recordedCount = results.filter((recorded) => recorded).length;
      const expectedRecordedCount = 1;
      expect(recordedCount).toBe(expectedRecordedCount);
      await expect(countSubmissionsFor(ipHash)).resolves.toBe(MAX_SUBMISSIONS);
    });
  });
});

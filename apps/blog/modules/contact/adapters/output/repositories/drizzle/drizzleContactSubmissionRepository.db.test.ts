import { count, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { contactSubmissions } from '../../../../../../infrastructure/drizzle/schema';
import {
  getTestDb,
  truncateAllTables,
} from '../../../../../post/adapters/shared/testing/testDatabase';
import { DrizzleContactSubmissionRepository } from './contactSubmissionRepository';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const TWENTY_FIVE_HOURS_IN_MS = 25 * ONE_HOUR_IN_MS;
const TWENTY_THREE_HOURS_IN_MS = 23 * ONE_HOUR_IN_MS;

describe('DrizzleContactSubmissionRepository', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  describe('countSince', () => {
    it('counts only submissions for the IP hash inside the time window', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const otherIpHash = 'other-ip-hash';
      const windowStart = new Date('2026-07-04T11:00:00.000Z');
      await db.insert(contactSubmissions).values([
        {
          ipHash,
          createdAt: new Date('2026-07-04T11:30:00.000Z'),
        },
        {
          ipHash,
          createdAt: new Date('2026-07-04T10:59:59.000Z'),
        },
        {
          ipHash: otherIpHash,
          createdAt: new Date('2026-07-04T11:45:00.000Z'),
        },
      ]);

      const result = await sut.countSince(ipHash, windowStart);

      const expectedCount = 1;
      expect(result).toBe(expectedCount);
    });
  });

  describe('record', () => {
    it('inserts a submission and prunes submissions older than twenty four hours', async () => {
      const db = getTestDb();
      const sut = new DrizzleContactSubmissionRepository(db);
      const ipHash = 'target-ip-hash';
      const oldIpHash = 'old-ip-hash';
      const recentIpHash = 'recent-ip-hash';
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

      await sut.record(ipHash);

      const [oldSubmissionCount] = await db
        .select({ value: count() })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.ipHash, oldIpHash));
      const [recentSubmissionCount] = await db
        .select({ value: count() })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.ipHash, recentIpHash));
      const [newSubmissionCount] = await db
        .select({ value: count() })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.ipHash, ipHash));
      const expectedOldSubmissionCount = 0;
      const expectedRecentSubmissionCount = 1;
      const expectedNewSubmissionCount = 1;
      expect(oldSubmissionCount.value).toBe(expectedOldSubmissionCount);
      expect(recentSubmissionCount.value).toBe(expectedRecentSubmissionCount);
      expect(newSubmissionCount.value).toBe(expectedNewSubmissionCount);
    });
  });
});

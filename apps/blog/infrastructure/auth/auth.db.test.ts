import { afterEach, describe, expect, it } from 'vitest';

import {
  getTestDb,
  truncateAllTables,
} from '../../modules/post/adapters/shared/testing/testDatabase';
import { users } from '../drizzle/schema';
import { auth } from './auth';

describe('auth instance', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  describe('getSession', () => {
    it('returns null when no session cookie is present', async () => {
      const sut = auth;

      const session = await sut.api.getSession({ headers: new Headers() });

      expect(session).toBeNull();
    });
  });

  describe('drizzle adapter wiring', () => {
    it('reaches the migrated User table', async () => {
      const storedUsers = await getTestDb().select().from(users);

      expect(storedUsers).toEqual([]);
    });
  });
});

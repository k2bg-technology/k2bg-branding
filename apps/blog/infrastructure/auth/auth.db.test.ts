import { describe, expect, it } from 'vitest';

import { getTestDb } from '../../modules/post/adapters/shared/testing/testDatabase';
import { users } from '../drizzle/schema';

describe('auth instance', () => {
  describe('drizzle adapter wiring', () => {
    it('reaches the migrated User table', async () => {
      const storedUsers = await getTestDb().select().from(users);

      expect(storedUsers).toEqual([]);
    });
  });
});

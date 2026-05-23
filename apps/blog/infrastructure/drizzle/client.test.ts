import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDrizzleClient,
  getDrizzleClient,
  resetDrizzleClient,
} from './client';

const endMock = vi.fn().mockResolvedValue(undefined);
const postgresMock = vi.fn((..._args: unknown[]) => ({ end: endMock }));

vi.mock('postgres', () => ({
  default: (...args: unknown[]) => postgresMock(...args),
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn((client: unknown) => ({ __client: client })),
}));

describe('drizzle/client', () => {
  beforeEach(async () => {
    await resetDrizzleClient();
    postgresMock.mockClear();
    endMock.mockClear();
  });

  afterEach(async () => {
    await resetDrizzleClient();
  });

  describe('createDrizzleClient', () => {
    it('creates a new Drizzle client instance', () => {
      const sut = createDrizzleClient();

      expect(sut).toBeDefined();
    });

    it('creates different instances on each call', () => {
      const client1 = createDrizzleClient();
      const client2 = createDrizzleClient();

      expect(client1).not.toBe(client2);
    });

    it('initialises the underlying postgres client with Lambda-safe options', () => {
      createDrizzleClient();

      expect(postgresMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          max: 1,
          idle_timeout: 20,
          connect_timeout: 30,
        })
      );
    });
  });

  describe('getDrizzleClient', () => {
    it('returns a Drizzle client instance', () => {
      const sut = getDrizzleClient();

      expect(sut).toBeDefined();
    });

    it('returns the same instance on multiple calls', () => {
      const client1 = getDrizzleClient();
      const client2 = getDrizzleClient();

      expect(client1).toBe(client2);
    });

    it('creates the underlying postgres client only once', () => {
      getDrizzleClient();
      getDrizzleClient();

      expect(postgresMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetDrizzleClient', () => {
    it('resets the singleton instance', async () => {
      const client1 = getDrizzleClient();
      await resetDrizzleClient();
      const client2 = getDrizzleClient();

      expect(client1).not.toBe(client2);
    });

    it('calls end on the underlying postgres client', async () => {
      getDrizzleClient();

      await resetDrizzleClient();

      expect(endMock).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when no singleton is active', async () => {
      await resetDrizzleClient();

      expect(endMock).not.toHaveBeenCalled();
    });
  });
});

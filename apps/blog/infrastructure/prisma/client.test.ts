import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  createPrismaClient,
  getPrismaClient,
  resetPrismaClient,
} from './client';

vi.mock('@prisma/client', () => {
  const mockPrismaClient = vi.fn().mockImplementation(() => ({
    $disconnect: vi.fn().mockResolvedValue(undefined),
  }));
  return { PrismaClient: mockPrismaClient };
});

describe('prisma/client', () => {
  beforeEach(async () => {
    await resetPrismaClient();
  });

  afterEach(async () => {
    await resetPrismaClient();
  });

  describe('createPrismaClient', () => {
    it('creates a new PrismaClient instance', () => {
      const client = createPrismaClient();

      expect(client).toBeDefined();
    });

    it('creates different instances on each call', () => {
      const client1 = createPrismaClient();
      const client2 = createPrismaClient();

      expect(client1).not.toBe(client2);
    });
  });

  describe('getPrismaClient', () => {
    it('returns a PrismaClient instance', () => {
      const client = getPrismaClient();

      expect(client).toBeDefined();
    });

    it('returns the same instance on multiple calls', () => {
      const client1 = getPrismaClient();
      const client2 = getPrismaClient();

      expect(client1).toBe(client2);
    });
  });

  describe('resetPrismaClient', () => {
    it('resets the singleton instance', async () => {
      const client1 = getPrismaClient();
      await resetPrismaClient();
      const client2 = getPrismaClient();

      expect(client1).not.toBe(client2);
    });

    it('calls $disconnect on existing instance', async () => {
      const client = getPrismaClient();
      await resetPrismaClient();

      expect(client.$disconnect).toHaveBeenCalled();
    });
  });
});

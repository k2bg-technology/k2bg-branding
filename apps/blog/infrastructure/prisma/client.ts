import { PrismaClient } from '@prisma/client';

let prismaClientInstance: PrismaClient | null = null;

/**
 * Get the singleton Prisma client instance.
 * Creates a new instance if one doesn't exist.
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient();
  }
  return prismaClientInstance;
}

/**
 * Create a new Prisma client instance.
 * Use this for testing or when you need a fresh instance.
 */
export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

/**
 * Disconnect and reset the singleton Prisma client.
 * Primarily used for testing cleanup.
 */
export async function resetPrismaClient(): Promise<void> {
  if (prismaClientInstance) {
    await prismaClientInstance.$disconnect();
    prismaClientInstance = null;
  }
}

export type { PrismaClient };

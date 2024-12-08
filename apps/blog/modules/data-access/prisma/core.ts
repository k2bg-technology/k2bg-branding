import { PrismaClient } from '@prisma/client';

export class Core {
  prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  static objectIdToUuid<T extends object & { id: number; uuid: string }>(
    args: T
  ): Omit<T, 'uuid'> {
    return {
      ...args,
      id: args.uuid,
    };
  }
}

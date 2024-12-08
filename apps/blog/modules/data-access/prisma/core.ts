import { PrismaClient } from '@prisma/client';

export class Core {
  prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }
}

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../../../infrastructure/drizzle/schema';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined;
let db: TestDb | undefined;

export function getTestDb(): TestDb {
  if (db) {
    return db;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set — make sure the node-db Vitest project ran vitest.globalSetup.node-db.ts.'
    );
  }
  client = postgres(url, { max: 5 });
  db = drizzle(client, { schema });
  return db;
}

export async function closeTestDb(): Promise<void> {
  if (!client) {
    return;
  }
  await client.end();
  client = undefined;
  db = undefined;
}

export async function truncateAllTables(): Promise<void> {
  await getTestDb().execute(
    sql`TRUNCATE TABLE "Post", "Author" RESTART IDENTITY CASCADE`
  );
}

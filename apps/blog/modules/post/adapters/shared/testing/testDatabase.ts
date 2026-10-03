import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../../../infrastructure/drizzle/schema';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

// biome-ignore lint/plugin/noLet: The test database client persists across setup, queries, and teardown.
let client: ReturnType<typeof postgres> | undefined;
// biome-ignore lint/plugin/noLet: The test database handle persists across setup, queries, and teardown.
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
    sql`TRUNCATE TABLE "Post", "Author", "Session", "Account", "Verification", "User", "contact_submissions" RESTART IDENTITY CASCADE`
  );
}

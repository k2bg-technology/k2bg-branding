import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { dirname, join } from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll } from 'vitest';
import { closeTestDb } from './modules/post/adapters/shared/testing/testDatabase';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = join(__dirname, 'infrastructure/drizzle/migrations');
// Pinned to the production image major so test fixtures match Lambda runtime.
const POSTGRES_IMAGE = 'postgres:15-alpine';

let container: StartedPostgreSqlContainer | undefined;

beforeAll(async () => {
  container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const url = container.getConnectionUri();
  process.env.TEST_DATABASE_URL = url;

  const migrationClient = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
  } finally {
    await migrationClient.end();
  }
}, 120_000);

afterAll(async () => {
  await closeTestDb();
  await container?.stop();
});

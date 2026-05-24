import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { dirname, join } from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = join(__dirname, 'infrastructure/drizzle/migrations');
// Pinned to the production image major so test fixtures match Lambda runtime.
const POSTGRES_IMAGE = 'postgres:15-alpine';

let container: StartedPostgreSqlContainer | undefined;

export async function setup(): Promise<void> {
  container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const url = container.getConnectionUri();
  // Override DATABASE_URL (rather than using a separate TEST_DATABASE_URL)
  // so any production code path that reads it via getDrizzleClient() lands
  // on the Testcontainers instance instead of the developer's local or CI
  // shell value. The override only lives in the test process and its forks.
  process.env.DATABASE_URL = url;

  const migrationClient = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
  } finally {
    await migrationClient.end();
  }
}

export async function teardown(): Promise<void> {
  await container?.stop();
  container = undefined;
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Lambda-safe defaults for the postgres-js client.
 *
 * @see https://orm.drizzle.team/docs/perf-serverless — keep the connection
 * declared at module scope so it can be reused across handler invocations
 * within the same execution context.
 */
const LAMBDA_SAFE_OPTIONS = {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
} as const;

type PostgresClient = ReturnType<typeof postgres>;
export type DrizzleClient = ReturnType<
  typeof drizzle<typeof schema, PostgresClient>
>;

let postgresClientInstance: PostgresClient | null = null;
let drizzleClientInstance: DrizzleClient | null = null;

function createPostgresClient(): PostgresClient {
  return postgres(process.env.DATABASE_URL ?? '', LAMBDA_SAFE_OPTIONS);
}

/**
 * Create a new Drizzle client instance.
 * Use this for testing or when you need a fresh instance.
 */
export function createDrizzleClient(): DrizzleClient {
  const client = createPostgresClient();
  return drizzle(client, { schema });
}

/**
 * Get the singleton Drizzle client instance.
 * Creates a new instance if one doesn't exist.
 */
export function getDrizzleClient(): DrizzleClient {
  if (!drizzleClientInstance) {
    postgresClientInstance = createPostgresClient();
    drizzleClientInstance = drizzle(postgresClientInstance, { schema });
  }
  return drizzleClientInstance;
}

/**
 * Disconnect and reset the singleton Drizzle client.
 * Primarily used for testing cleanup.
 */
export async function resetDrizzleClient(): Promise<void> {
  if (postgresClientInstance) {
    await postgresClientInstance.end();
  }
  postgresClientInstance = null;
  drizzleClientInstance = null;
}

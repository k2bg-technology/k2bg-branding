import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to baseline Drizzle migrations.');
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(
  currentDir,
  '../infrastructure/drizzle/migrations',
);
const [initialMigration] = readMigrationFiles({ migrationsFolder });

if (!initialMigration) {
  throw new Error('No Drizzle migration was found to baseline.');
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  const [schemaState] = await sql`
    SELECT
      to_regclass('public."Author"') IS NOT NULL AS has_author_table,
      to_regclass('public."Post"') IS NOT NULL AS has_post_table,
      to_regtype('public."Category"') IS NOT NULL AS has_category_enum,
      to_regtype('public."Status"') IS NOT NULL AS has_status_enum,
      to_regtype('public."Type"') IS NOT NULL AS has_type_enum,
      to_regclass('drizzle."__drizzle_migrations"') IS NOT NULL AS has_drizzle_journal
  `;

  let hasAppliedDrizzleMigration = false;

  if (schemaState.has_drizzle_journal) {
    const [journalState] =
      await sql`SELECT COUNT(*)::int AS migration_count FROM drizzle.__drizzle_migrations`;

    hasAppliedDrizzleMigration = journalState.migration_count > 0;
  }

  if (!hasAppliedDrizzleMigration) {
    const hasExistingBlogSchema =
      schemaState.has_author_table ||
      schemaState.has_post_table ||
      schemaState.has_category_enum ||
      schemaState.has_status_enum ||
      schemaState.has_type_enum;

    if (hasExistingBlogSchema) {
      const hasCompleteBaselineSchema =
        schemaState.has_author_table &&
        schemaState.has_post_table &&
        schemaState.has_category_enum &&
        schemaState.has_status_enum &&
        schemaState.has_type_enum;

      if (!hasCompleteBaselineSchema) {
        throw new Error(
          'Existing blog database schema is incomplete; refusing to baseline Drizzle migrations.',
        );
      }

      await sql.begin(async (tx) => {
        await tx`CREATE SCHEMA IF NOT EXISTS drizzle`;
        await tx`
          CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
            id SERIAL PRIMARY KEY,
            hash text NOT NULL,
            created_at bigint
          )
        `;
        await tx`
          INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
          VALUES (${initialMigration.hash}, ${initialMigration.folderMillis})
        `;
      });
    }
  }
} finally {
  await sql.end();
}

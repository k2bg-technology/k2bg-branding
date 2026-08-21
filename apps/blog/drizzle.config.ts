import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './infrastructure/drizzle/schema.ts',
  out: './infrastructure/drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Restrict introspection to the application's own tables so a `drizzle-kit
  // pull` / `generate` diff against the live database is not polluted by the
  // residual `_prisma_migrations` bookkeeping table.
  tablesFilter: [
    'Author',
    'Post',
    'User',
    'Session',
    'Account',
    'Verification',
    'contact_submissions',
  ],
  strict: true,
  verbose: true,
});

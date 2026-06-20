import { resetDrizzleClient } from '../infrastructure/drizzle/client';
import { provisionAdminUser } from '../infrastructure/auth/provisionAdminUser';

// One-off operator script: provisions the first administrator from environment
// variables. No public sign-up exists; see apps/blog/specs/auth.md.
// Usage: ADMIN_EMAIL=… ADMIN_PASSWORD=… DATABASE_URL=… pnpm -F blog db:seed:admin
async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required'
    );
  }

  // Never log the password.
  const result = await provisionAdminUser({ email, password, name });
  if (result.status === 'already-exists') {
    console.log(`Administrator already exists: ${email} (no changes)`);
    return;
  }
  console.log(`Administrator created: ${email}`);
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : 'Failed to seed administrator'
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await resetDrizzleClient();
  });

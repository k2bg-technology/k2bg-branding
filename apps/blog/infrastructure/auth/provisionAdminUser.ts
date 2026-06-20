import { auth } from './auth';

// better-auth's default emailAndPassword.minPasswordLength. internalAdapter
// bypasses the sign-up route's own validation, so we re-check it here.
const MINIMUM_PASSWORD_LENGTH = 8;

interface ProvisionAdminInput {
  email: string;
  password: string;
  name: string;
}

interface ProvisionAdminResult {
  status: 'created' | 'already-exists';
  userId: string;
}

/**
 * Create the first administrator. Public sign-up is disabled
 * (`disableSignUp: true`), so we provision through the auth context exactly as
 * better-auth's own admin plugin does: createUser + provider-owned password
 * hash + credential account link. Idempotent — re-running is a no-op.
 *
 * @see apps/blog/specs/auth.md (first-administrator provisioning)
 */
export async function provisionAdminUser(
  input: ProvisionAdminInput
): Promise<ProvisionAdminResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error('Admin email is required');
  }
  if (input.password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new Error(
      `Admin password must be at least ${MINIMUM_PASSWORD_LENGTH} characters`
    );
  }

  const context = await auth.$context;

  const existing = await context.internalAdapter.findUserByEmail(email);
  if (existing) {
    return { status: 'already-exists', userId: existing.user.id };
  }

  const user = await context.internalAdapter.createUser({
    email,
    name: input.name,
    emailVerified: false,
  });

  const hashedPassword = await context.password.hash(input.password);
  await context.internalAdapter.linkAccount({
    accountId: user.id,
    providerId: 'credential',
    password: hashedPassword,
    userId: user.id,
  });

  return { status: 'created', userId: user.id };
}

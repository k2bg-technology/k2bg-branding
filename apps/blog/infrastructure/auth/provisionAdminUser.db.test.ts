import { afterEach, describe, expect, it } from 'vitest';

import {
  getTestDb,
  truncateAllTables,
} from '../../modules/post/adapters/shared/testing/testDatabase';
import { users } from '../drizzle/schema';
import { auth } from './auth';
import { provisionAdminUser } from './provisionAdminUser';

function createAdminInput(overrides: Partial<Parameters<typeof provisionAdminUser>[0]> = {}) {
  return {
    email: 'admin@example.com',
    password: 'changeme123',
    name: 'Administrator',
    ...overrides,
  };
}

describe('provisionAdminUser', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  it('creates a single administrator with a linked credential account', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput();

    const result = await sut(input);

    expect(result.status).toBe('created');
    const storedUsers = await getTestDb().select().from(users);
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0]?.email).toBe(input.email);
  });

  it('provisions an administrator that can sign in with the seeded credentials', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput();
    await sut(input);

    const signIn = await auth.api.signInEmail({
      body: { email: input.email, password: input.password },
    });

    expect(signIn.user.email).toBe(input.email);
  });

  it('returns already-exists and creates no duplicate when run twice', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput();
    await sut(input);

    const result = await sut(input);

    expect(result.status).toBe('already-exists');
    const storedUsers = await getTestDb().select().from(users);
    expect(storedUsers).toHaveLength(1);
  });

  it('repairs an administrator left without a credential account by an interrupted run', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput();
    const context = await auth.$context;
    await context.internalAdapter.createUser({
      email: input.email,
      name: input.name,
      emailVerified: false,
    });

    const result = await sut(input);

    expect(result.status).toBe('created');
    const signIn = await auth.api.signInEmail({
      body: { email: input.email, password: input.password },
    });
    expect(signIn.user.email).toBe(input.email);
  });

  it('refuses to provision a second administrator with a different email', async () => {
    const sut = provisionAdminUser;
    await sut(createAdminInput());

    await expect(
      sut(createAdminInput({ email: 'second@example.com' }))
    ).rejects.toThrow('refusing to provision a second administrator');
    const storedUsers = await getTestDb().select().from(users);
    expect(storedUsers).toHaveLength(1);
  });

  it('throws and creates no user when the admin email is invalid', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput({ email: 'admin' });

    await expect(sut(input)).rejects.toThrow('valid email address');
    const storedUsers = await getTestDb().select().from(users);
    expect(storedUsers).toHaveLength(0);
  });

  it('throws when the password is shorter than the minimum length', async () => {
    const sut = provisionAdminUser;
    const input = createAdminInput({ password: 'short' });

    await expect(sut(input)).rejects.toThrow(
      'Admin password must be at least 8 characters'
    );
  });
});

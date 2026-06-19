import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDrizzleClient } from '../drizzle/client';
import { accounts, sessions, users, verifications } from '../drizzle/schema';

// Authentication mechanics (credential storage, password hashing, session
// lifecycle) are owned by better-auth; the application only owns route
// protection and admin provisioning.
// @see apps/blog/specs/auth.md, decisions/0001-use-better-auth.md
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(getDrizzleClient(), {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // No public sign-up; the first administrator is provisioned by a seed script.
    disableSignUp: true,
  },
});

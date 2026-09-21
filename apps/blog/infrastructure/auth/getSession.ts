import { headers } from 'next/headers';

import { auth } from './auth';

// Server-side authoritative session read for server components (login redirect,
// settings layout gate).
export async function getSession(): Promise<
  Awaited<ReturnType<typeof auth.api.getSession>>
> {
  return auth.api.getSession({ headers: await headers() });
}

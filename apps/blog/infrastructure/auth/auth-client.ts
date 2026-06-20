import { createAuthClient } from 'better-auth/react';

// Same-origin: the client targets /api/auth/* on the current host, so no
// baseURL is needed.
export const authClient = createAuthClient();

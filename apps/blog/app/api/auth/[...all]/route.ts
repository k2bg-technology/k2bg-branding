import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '../../../../infrastructure/auth/auth';

// better-auth owns `/api/auth/*`; all other `/api/*` paths fall through to the
// Hono catch-all at app/api/[[...route]]/route.ts.
export const { GET, POST } = toNextJsHandler(auth);

import type { NextRequest } from 'next/server';
import { createSyncPostsFromExternalUseCase } from '../../../infrastructure/di';
import { postLogger } from '../../../modules/post/adapters/shared';

export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.API_KEY) {
    return new Response('unauthorized please set x-api-key', { status: 401 });
  }

  try {
    const result = await createSyncPostsFromExternalUseCase().execute();
    postLogger.info({ path: request.nextUrl.pathname }, 'Posts sync completed');
    return Response.json(result);
  } catch (err) {
    postLogger.error(
      { err, path: request.nextUrl.pathname },
      'Posts sync failed'
    );
    throw err;
  }
}

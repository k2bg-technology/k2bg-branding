import type { NextRequest } from 'next/server';
import { createSyncHeroImagesUseCase } from '../../../infrastructure/di';
import { postLogger } from '../../../modules/post/adapters/shared';

export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.API_KEY) {
    return new Response('unauthorized please set x-api-key', { status: 401 });
  }

  try {
    const result = await createSyncHeroImagesUseCase().execute();
    postLogger.info(
      { path: request.nextUrl.pathname },
      'Hero images sync completed'
    );
    return Response.json(result);
  } catch (err) {
    postLogger.error(
      { err, path: request.nextUrl.pathname },
      'Hero images sync failed'
    );
    throw err;
  }
}

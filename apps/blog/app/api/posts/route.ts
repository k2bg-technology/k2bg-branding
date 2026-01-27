import type { NextRequest } from 'next/server';
import { createSyncPostsFromExternalUseCase } from '../../../infrastructure/di';

export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.API_KEY) {
    return new Response('unauthorized please set x-api-key', { status: 401 });
  }

  const result = await createSyncPostsFromExternalUseCase().execute();

  return Response.json(result);
}

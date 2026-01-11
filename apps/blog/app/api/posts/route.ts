import type { NextRequest } from 'next/server';
import * as Notion from '../../../modules/data-access/notion';
import * as Prisma from '../../../modules/data-access/prisma';
import * as UseCases from '../../../modules/use-cases';

export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.API_KEY) {
    return new Response('unauthorized please set x-api-key', { status: 401 });
  }

  const posts = await new UseCases.Post.UpsertPosts(
    new Notion.Post.Repository(),
    new Prisma.Post.Repository()
  ).execute();

  return Response.json(posts);
}

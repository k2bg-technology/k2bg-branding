import * as UseCases from '../../../modules/use-cases';
import * as Notion from '../../../modules/data-access/notion';
import * as Prisma from '../../../modules/data-access/prisma';

export async function PATCH() {
  const posts = await new UseCases.Post.UpsertPosts(
    new Notion.Post.Repository(),
    new Prisma.Post.Repository()
  ).execute();

  return Response.json(posts);
}

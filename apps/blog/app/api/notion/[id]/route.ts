import { type NextRequest } from 'next/server';
import Notion from '../../../modules/data-access/notion';
import Article from '../../../modules/domain/article';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const notionFetcher = new Notion.Fetcher();
  const page = new Notion.Page(await notionFetcher.fetchPage(id));
  const article = new Article.Single(page);
  const buffer =
    article.image &&
    (await fetch(article.image).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    ));

  const blob = (buffer && new Blob([buffer], { type: 'image/jpg' })) ?? '';

  return new Response(blob, {
    status: 200,
  });
}

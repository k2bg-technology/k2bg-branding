import { type NextRequest } from 'next/server';
import Notion from '../../../../modules/data-access/notion';
import Media from '../../../../modules/domain/media';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const notionFetcher = new Notion.Fetcher();
  const page = new Notion.Page(await notionFetcher.fetchPage(id));
  const mediaImage = new Media.Image(page);
  const buffer =
    mediaImage.file &&
    (await fetch(mediaImage.file).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    ));

  const blob = (buffer && new Blob([buffer], { type: 'image/jpg' })) ?? '';

  return new Response(blob, {
    status: 200,
  });
}

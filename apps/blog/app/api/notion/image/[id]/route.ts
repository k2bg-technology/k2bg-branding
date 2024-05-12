import { type NextRequest } from 'next/server';
import Notion from '../../../../modules/data-access/notion';
import DataType from '../../../../modules/domain/data-type';
import Article from '../../../../modules/domain/article';
import Affiliate from '../../../../modules/domain/affiliate';
import Media from '../../../../modules/domain/media';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const notionFetcher = new Notion.Fetcher();
  const page = new Notion.Page(await notionFetcher.fetchPage(id));
  const dataType = new DataType.Core(page).name;

  const image = ((dataType) => {
    if (!dataType) return;

    switch (dataType) {
      case 'article':
        return new Article.Single(page).image;
      case 'affiliateProduct':
        return new Affiliate.Product(page).imageFile;
      case 'affiliateBanner':
        return new Affiliate.Banner(page).imageUrl;
      case 'mediaImage':
        return new Media.Image(page).file;
      case 'page':
      case 'affiliateText':
      case 'mediaVideo':
      case 'mediaAudio':
        return undefined;
      default:
        ((_: never) => null)(dataType);
    }
  })(dataType);

  const buffer =
    image &&
    (await fetch(image).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    ));

  const blob = (buffer && new Blob([buffer], { type: 'image/jpg' })) ?? '';
  const response = new Response(blob, {
    status: 200,
  });
  response.headers.set('Content-Type', 'image/jpg');
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=86400, max-age=86400, stale-while-revalidate=86400'
  );

  return response;
}

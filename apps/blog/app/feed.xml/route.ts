import { createFetchPostSummariesUseCase } from '../../infrastructure/di';
import { PostStatus } from '../../modules/post/domain';
import type { PostSummaryOutput } from '../../modules/post/use-cases';
import { getBlogSiteBaseUrl } from '../siteMetadata';
import { buildRssFeed } from './rss';

export const revalidate = 3600;

const PAGE_SIZE = 100;

export async function GET(): Promise<Response> {
  const posts = await fetchAllPublishedPostSummaries();
  const rssFeed = buildRssFeed({
    baseUrl: getBlogSiteBaseUrl(),
    posts,
  });

  return new Response(rssFeed, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

async function fetchAllPublishedPostSummaries() {
  const fetchPostSummaries = createFetchPostSummariesUseCase();
  const fetchPage = async (
    page: number,
    previousPosts: PostSummaryOutput[]
  ): Promise<PostSummaryOutput[]> => {
    const result = await fetchPostSummaries.execute({
      page,
      pageSize: PAGE_SIZE,
      status: PostStatus.PUBLISHED,
    });
    const posts = previousPosts.concat(result.items);

    if (!result.hasNextPage) {
      return posts;
    }

    return fetchPage(page + 1, posts);
  };

  return fetchPage(1, []);
}

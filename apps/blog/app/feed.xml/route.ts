import { cacheLife, cacheTag } from 'next/cache';
import { fetchPostSummaries } from '../../infrastructure/cache/posts';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';
import { PostStatus } from '../../modules/post/domain';
import type { PostSummaryOutput } from '../../modules/post/use-cases';
import { getBlogSiteBaseUrl } from '../siteMetadata';
import { buildRssFeed } from './rss';

const PAGE_SIZE = 100;

export async function GET(): Promise<Response> {
  const posts = await fetchAllPublishedPostSummaries();
  const rssFeed = await buildCachedRssFeed(getBlogSiteBaseUrl(), posts);

  return new Response(rssFeed, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

// The feed's lastBuildDate reads the clock and shares the content's hourly cache policy.
async function buildCachedRssFeed(
  baseUrl: string,
  posts: PostSummaryOutput[]
): Promise<string> {
  'use cache';
  cacheLife('hours');
  cacheTag(BLOG_CACHE_TAG, '/feed.xml');
  return buildRssFeed({ baseUrl, posts });
}

async function fetchAllPublishedPostSummaries() {
  const fetchPage = async (
    page: number,
    previousPosts: PostSummaryOutput[]
  ): Promise<PostSummaryOutput[]> => {
    const result = await fetchPostSummaries({
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

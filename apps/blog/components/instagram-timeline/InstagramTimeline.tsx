import { cacheLife, cacheTag } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { after } from 'next/server';
import {
  type CachedReadResult,
  RECOVERABLE_FAILURE_CACHE_LIFE,
  restoreCacheError,
  serializeCacheError,
} from '../../infrastructure/cache/readResult';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';

import { createFetchFeedUseCase } from '../../infrastructure/di/social-feed';
import { socialFeedLogger } from '../../modules/social-feed/adapters/shared/logger';
import type { FetchFeedOutput } from '../../modules/social-feed/use-cases';

const MAX_MEDIA_COUNT = 6;

export async function InstagramTimeline() {
  const result = await fetchFeed();
  if ('error' in result) {
    // Pino's timestamp reads the clock, so logging runs after prerendering.
    after(() =>
      socialFeedLogger.error(
        { err: restoreCacheError(result.error) },
        'Failed to fetch Instagram feed'
      )
    );
    return null;
  }

  const posts = result.data;
  if (posts.length === 0) {
    return (
      <div className="p-spacious rounded-lg bg-base-white/50">
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          新規投稿はありません
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
        >
          <div className="relative w-[8.625rem] h-[8.625rem]">
            <Image
              alt="instagram media"
              src={post.displayUrl}
              className="aspect-square w-full h-full object-cover"
              width={138}
              height={138}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

// Recoverable failures cross the cache as data so prerendering retains the fallback.
async function fetchFeed(): Promise<CachedReadResult<FetchFeedOutput>> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  try {
    const data = await createFetchFeedUseCase().execute({
      limit: MAX_MEDIA_COUNT,
    });
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return { error: serializeCacheError(error) };
  }
}

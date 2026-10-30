import { cacheLife, cacheTag } from 'next/cache';
import { after } from 'next/server';
import {
  type CachedReadResult,
  RECOVERABLE_FAILURE_CACHE_LIFE,
  restoreCacheError,
  serializeCacheError,
} from '../../infrastructure/cache/readResult';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';
import { createFetchMediaUseCase } from '../../infrastructure/di/media';
import { mediaLogger } from '../../modules/media/adapters/shared/logger';
import { MediaType } from '../../modules/media/domain';
import type { FetchMediaOutput } from '../../modules/media/use-cases';
import { MediaImage } from './MediaImage';
import { MediaVideo } from './MediaVideo';

interface MediaEmbProps {
  id: string;
}

export async function MediaEmb(props: MediaEmbProps) {
  const { id } = props;

  const result = await fetchMedia(id);
  if ('error' in result) {
    // Pino's timestamp reads the clock, so logging runs after prerendering.
    after(() =>
      mediaLogger.error(
        { err: restoreCacheError(result.error), id },
        'Failed to fetch media embed'
      )
    );
    return null;
  }

  const { media } = result.data;

  return (
    <div className="flex justify-center mt-4">
      {(() => {
        switch (media.type) {
          case MediaType.IMAGE:
            return <MediaImage media={media} />;
          case MediaType.VIDEO:
            return <MediaVideo media={media} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

// Recoverable failures cross the cache as data so prerendering retains the fallback.
async function fetchMedia(
  id: string
): Promise<CachedReadResult<FetchMediaOutput>> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  try {
    const data = await createFetchMediaUseCase().execute({ id });
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return { error: serializeCacheError(error) };
  }
}

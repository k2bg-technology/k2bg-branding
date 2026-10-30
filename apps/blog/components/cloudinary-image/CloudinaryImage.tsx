import { cacheLife, cacheTag } from 'next/cache';
import Image, { type ImageProps } from 'next/image';
import { Icon, Skeleton } from 'ui';

import {
  type CachedReadResult,
  RECOVERABLE_FAILURE_CACHE_LIFE,
  restoreCacheError,
  serializeCacheError,
} from '../../infrastructure/cache/readResult';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';
import {
  getOptimizedImageUrl,
  getPlaceholderImageUrl,
} from '../../infrastructure/cloudinary';

interface CloudinaryImageProps
  extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  publicId: string;
}

export async function CloudinaryImage(props: CloudinaryImageProps) {
  const { publicId, alt, ...rest } = props;

  try {
    const optimizedImageUrl = getOptimizedImageUrl(publicId);
    const placeholderImageUrl = getPlaceholderImageUrl(publicId);
    const placeholder = await fetchPlaceholderImage(placeholderImageUrl);
    if ('error' in placeholder) {
      throw restoreCacheError(placeholder.error);
    }

    return (
      <Image
        {...rest}
        src={optimizedImageUrl}
        alt={alt}
        placeholder="blur"
        blurDataURL={placeholder.data}
      />
    );
  } catch {
    return (
      <Skeleton className="w-full h-full">
        <Skeleton.Box className="w-full h-full">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={30}
            height={30}
          />
        </Skeleton.Box>
      </Skeleton>
    );
  }
}

// Cache the network read so images prerender, with short-lived data for recoverable failures.
async function fetchPlaceholderImage(
  url: string
): Promise<CachedReadResult<string>> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  try {
    const response = await fetch(url);
    const data = `data:image/webp;base64,${Buffer.from(
      await response.arrayBuffer()
    ).toString('base64')}`;
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return { error: serializeCacheError(error) };
  }
}

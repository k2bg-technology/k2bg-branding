import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';
import type {
  FetchAllSlugsOutput,
  FetchPostOutput,
  FetchPostSummariesByCategoryInput,
  FetchPostSummariesByCategoryOutput,
  FetchPostSummariesInput,
  FetchPostSummariesOutput,
} from '../../modules/post/use-cases';
import { UseCaseError } from '../../modules/post/use-cases/shared';
import {
  createFetchAllSlugsUseCase,
  createFetchPostSummariesByCategoryUseCase,
  createFetchPostSummariesUseCase,
  createFetchPostUseCase,
} from '../di';
import {
  type CachedReadResult,
  RECOVERABLE_FAILURE_CACHE_LIFE,
  restoreCacheError,
  serializeCacheError,
} from './readResult';
import { BLOG_CACHE_TAG } from './tags';

type CachedPostReadResult<Output> =
  | { data: Output }
  | { error: ReturnType<typeof serializeCacheError>; isUseCaseError: boolean };

async function fetchCachedPost(
  id: string
): Promise<CachedPostReadResult<FetchPostOutput>> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG, '/blog/[id]/[slug]', '/concept');
  try {
    const data = await createFetchPostUseCase().execute({ id });
    cacheTag(`/blog/${data.post.slug}`);
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return {
      error: serializeCacheError(error),
      isUseCaseError: error instanceof UseCaseError,
    };
  }
}

// Restore application errors outside RSC cache serialization so page logging keeps its warn/error distinction.
export const fetchPost = cache(async (id: string): Promise<FetchPostOutput> => {
  const result = await fetchCachedPost(id);
  if ('error' in result) {
    if (result.isUseCaseError) {
      throw new UseCaseError(result.error.message);
    }
    throw restoreCacheError(result.error);
  }
  return result.data;
});

export async function fetchPostSummaries(
  input: FetchPostSummariesInput
): Promise<FetchPostSummariesOutput> {
  'use cache';
  cacheLife('hours');
  cacheTag(BLOG_CACHE_TAG, '/blog', '/feed.xml');
  return createFetchPostSummariesUseCase().execute(input);
}

// Application failures cross the cache as plain data, then regain their application-error classification.
export async function fetchPostSummariesByCategory(
  input: FetchPostSummariesByCategoryInput
): Promise<FetchPostSummariesByCategoryOutput> {
  const result = await fetchCachedPostSummariesByCategory(input);
  if ('error' in result) {
    if (result.isUseCaseError) {
      throw new UseCaseError(result.error.message);
    }
    throw restoreCacheError(result.error);
  }
  return result.data;
}

async function fetchCachedPostSummariesByCategory(
  input: FetchPostSummariesByCategoryInput
): Promise<CachedPostReadResult<FetchPostSummariesByCategoryOutput>> {
  'use cache';
  cacheTag(
    BLOG_CACHE_TAG,
    '/category/[category]',
    `/category/${input.category}`
  );
  try {
    const data =
      await createFetchPostSummariesByCategoryUseCase().execute(input);
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return {
      error: serializeCacheError(error),
      isUseCaseError: error instanceof UseCaseError,
    };
  }
}

export async function fetchAllSlugs(): Promise<FetchAllSlugsOutput> {
  const result = await fetchCachedAllSlugs();
  if ('error' in result) {
    throw restoreCacheError(result.error);
  }
  return result.data;
}

// Sitemap failures remain recoverable while generateStaticParams keeps rejecting them.
async function fetchCachedAllSlugs(): Promise<
  CachedReadResult<FetchAllSlugsOutput>
> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG, '/sitemap.xml', '/blog/[id]/[slug]');
  try {
    const data = await createFetchAllSlugsUseCase().execute();
    cacheLife('hours');
    return { data };
  } catch (error) {
    cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
    return { error: serializeCacheError(error) };
  }
}

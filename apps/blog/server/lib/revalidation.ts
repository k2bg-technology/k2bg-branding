import { logger } from 'logger';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';

const revalidationLogger = logger.child({ module: 'revalidation' });

export function revalidateBlogPages(): void {
  try {
    revalidateTag(BLOG_CACHE_TAG, 'max');
    revalidationLogger.info('Revalidated all blog pages');
  } catch (error) {
    revalidationLogger.error({ error }, 'Failed to revalidate blog pages');
    throw error;
  }
}

export function revalidateBlogPath(path: string): void {
  try {
    revalidateTag(path, 'max');
    revalidateTag(BLOG_CACHE_TAG, 'max');
    revalidationLogger.info({ path }, 'Revalidated path');
  } catch (error) {
    revalidationLogger.error({ error, path }, 'Failed to revalidate path');
    throw error;
  }
}

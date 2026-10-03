import { logger } from 'logger';
import { revalidatePath } from 'next/cache';

const revalidationLogger = logger.child({ module: 'revalidation' });

const BLOG_PATHS = [
  '/blog',
  '/blog/[id]/[slug]',
  '/category/[category]',
  '/concept',
] as const;

export function revalidateBlogPages(): void {
  try {
    for (const path of BLOG_PATHS) {
      revalidatePath(path, 'page');
    }
    revalidationLogger.info('Revalidated all blog pages');
  } catch (error) {
    revalidationLogger.error({ error }, 'Failed to revalidate blog pages');
    throw error;
  }
}

export function revalidateBlogPath(path: string): void {
  try {
    revalidatePath(path);
    revalidationLogger.info({ path }, 'Revalidated path');
  } catch (error) {
    revalidationLogger.error({ error, path }, 'Failed to revalidate path');
    throw error;
  }
}

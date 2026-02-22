import { revalidatePath } from 'next/cache';
import { logger } from '../../modules/shared/logger';

const revalidationLogger = logger.child({ module: 'revalidation' });

const BLOG_PATHS = [
  '/blog',
  '/blog/[id]/[slug]',
  '/category/[category]',
  '/concept',
] as const;

export function revalidateBlogPages(): void {
  for (const path of BLOG_PATHS) {
    revalidatePath(path, 'page');
  }
  revalidationLogger.info('Revalidated all blog pages');
}

export function revalidateBlogPath(path: string): void {
  revalidatePath(path);
  revalidationLogger.info({ path }, 'Revalidated path');
}

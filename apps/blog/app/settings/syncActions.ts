'use server';

import { logger } from 'logger';
import { updateTag } from 'next/cache';
import { getSession } from '../../infrastructure/auth/getSession';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';
import {
  createSyncHeroImagesUseCase,
  createSyncPostsFromExternalUseCase,
} from '../../infrastructure/di';
import type {
  SyncHeroImagesOutput,
  SyncPostsFromExternalOutput,
} from '../../modules/post/use-cases';

const syncLogger = logger.child({ module: 'settings-sync' });

// Server Actions are publicly callable POST endpoints, so the protected
// settings page guard is not enough: each action re-checks the session itself.
// @see apps/blog/specs/auth.md
async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
}

export async function syncPostsAction(): Promise<SyncPostsFromExternalOutput> {
  await requireSession();

  try {
    const result = await createSyncPostsFromExternalUseCase().execute();
    updateTag(BLOG_CACHE_TAG);
    syncLogger.info(
      { action: 'syncPostsAction', count: result.count },
      'Synced posts from external source'
    );
    return result;
  } catch (err) {
    syncLogger.error(
      { err, action: 'syncPostsAction' },
      'Failed to sync posts'
    );
    throw err;
  }
}

export async function syncHeroImagesAction(): Promise<SyncHeroImagesOutput> {
  await requireSession();

  try {
    const result = await createSyncHeroImagesUseCase().execute();
    updateTag(BLOG_CACHE_TAG);
    syncLogger.info(
      {
        action: 'syncHeroImagesAction',
        count: result.count,
        failedCount: result.failedCount,
      },
      'Synced hero images'
    );
    return result;
  } catch (err) {
    syncLogger.error(
      { err, action: 'syncHeroImagesAction' },
      'Failed to sync hero images'
    );
    throw err;
  }
}

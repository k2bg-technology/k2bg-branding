'use server';

import { getSession } from '../../infrastructure/auth/getSession';
import {
  createSyncHeroImagesUseCase,
  createSyncPostsFromExternalUseCase,
} from '../../infrastructure/di';
import { logger } from '../../modules/shared/logger';
import { revalidateBlogPages } from '../../server/lib/revalidation';

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

export async function syncPostsAction() {
  await requireSession();

  try {
    const result = await createSyncPostsFromExternalUseCase().execute();
    revalidateBlogPages();
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

export async function syncHeroImagesAction() {
  await requireSession();

  try {
    const result = await createSyncHeroImagesUseCase().execute();
    revalidateBlogPages();
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

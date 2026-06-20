import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  SyncHeroImagesOutput,
  SyncPostsFromExternalOutput,
} from '../../modules/post/use-cases';

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock('../../infrastructure/auth/getSession', () => ({
  getSession: mockGetSession,
}));

vi.mock('../../infrastructure/di', () => ({
  createSyncPostsFromExternalUseCase: vi.fn(),
  createSyncHeroImagesUseCase: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import {
  createSyncHeroImagesUseCase,
  createSyncPostsFromExternalUseCase,
} from '../../infrastructure/di';
import { syncHeroImagesAction, syncPostsAction } from './syncActions';

const mockCreateSyncPostsUseCase = vi.mocked(
  createSyncPostsFromExternalUseCase
);
const mockCreateSyncHeroImagesUseCase = vi.mocked(createSyncHeroImagesUseCase);

function stubSyncPostsWith(
  execute: Mock<() => Promise<SyncPostsFromExternalOutput>>
) {
  mockCreateSyncPostsUseCase.mockReturnValue({
    execute,
  } as unknown as ReturnType<typeof createSyncPostsFromExternalUseCase>);
}

function stubSyncHeroImagesWith(
  execute: Mock<() => Promise<SyncHeroImagesOutput>>
) {
  mockCreateSyncHeroImagesUseCase.mockReturnValue({
    execute,
  } as unknown as ReturnType<typeof createSyncHeroImagesUseCase>);
}

const activeSession = { user: { id: 'user-1', email: 'admin@example.com' } };

describe('syncPostsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the use case result when the session is valid', async () => {
    const syncResult = {
      syncedPosts: [],
      count: 3,
    } satisfies SyncPostsFromExternalOutput;
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncPostsWith(vi.fn().mockResolvedValue(syncResult));

    const result = await syncPostsAction();

    expect(result).toEqual(syncResult);
  });

  it('revalidates blog pages after a successful sync', async () => {
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncPostsWith(vi.fn().mockResolvedValue({ syncedPosts: [], count: 0 }));

    await syncPostsAction();

    expect(revalidatePath).toHaveBeenCalled();
  });

  it('rejects without running the use case when there is no session', async () => {
    const execute = vi.fn().mockResolvedValue({ syncedPosts: [], count: 0 });
    mockGetSession.mockResolvedValue(null);
    stubSyncPostsWith(execute);

    await expect(syncPostsAction()).rejects.toThrow('Unauthorized');
    expect(execute).not.toHaveBeenCalled();
  });

  it('propagates use case errors', async () => {
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncPostsWith(vi.fn().mockRejectedValue(new Error('Sync failed')));

    await expect(syncPostsAction()).rejects.toThrow('Sync failed');
  });
});

describe('syncHeroImagesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the use case result when the session is valid', async () => {
    const syncResult = {
      uploadedImages: [],
      count: 2,
      failedCount: 1,
    } satisfies SyncHeroImagesOutput;
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncHeroImagesWith(vi.fn().mockResolvedValue(syncResult));

    const result = await syncHeroImagesAction();

    expect(result).toEqual(syncResult);
  });

  it('revalidates blog pages after a successful sync', async () => {
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncHeroImagesWith(
      vi
        .fn()
        .mockResolvedValue({ uploadedImages: [], count: 0, failedCount: 0 })
    );

    await syncHeroImagesAction();

    expect(revalidatePath).toHaveBeenCalled();
  });

  it('rejects without running the use case when there is no session', async () => {
    const execute = vi
      .fn()
      .mockResolvedValue({ uploadedImages: [], count: 0, failedCount: 0 });
    mockGetSession.mockResolvedValue(null);
    stubSyncHeroImagesWith(execute);

    await expect(syncHeroImagesAction()).rejects.toThrow('Unauthorized');
    expect(execute).not.toHaveBeenCalled();
  });

  it('propagates use case errors', async () => {
    mockGetSession.mockResolvedValue(activeSession);
    stubSyncHeroImagesWith(
      vi.fn().mockRejectedValue(new Error('Upload failed'))
    );

    await expect(syncHeroImagesAction()).rejects.toThrow('Upload failed');
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SyncTriggers } from './SyncTriggers';

const { mockToastSuccess, mockToastError, mockSyncPosts, mockSyncHeroImages } =
  vi.hoisted(() => ({
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockSyncPosts: vi.fn(),
    mockSyncHeroImages: vi.fn(),
  }));

vi.mock('./syncActions', () => ({
  syncPostsAction: mockSyncPosts,
  syncHeroImagesAction: mockSyncHeroImages,
}));

vi.mock('ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ui')>();
  return {
    ...actual,
    useToast: () => ({
      toast: { success: mockToastSuccess, error: mockToastError },
    }),
  };
});

function renderSyncTriggers() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SyncTriggers />
    </QueryClientProvider>
  );
}

describe('SyncTriggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a success toast with the synced count when posts sync succeeds', async () => {
    mockSyncPosts.mockResolvedValue({ syncedPosts: [], count: 5 });
    const user = userEvent.setup();
    renderSyncTriggers();

    await user.click(
      screen.getByRole('button', { name: 'Notionから記事を同期' })
    );

    await waitFor(() =>
      expect(mockToastSuccess).toHaveBeenCalledWith(
        '記事を同期しました（5件）',
        expect.anything()
      )
    );
  });

  it('shows an error toast when posts sync fails', async () => {
    mockSyncPosts.mockRejectedValue(new Error('Sync failed'));
    const user = userEvent.setup();
    renderSyncTriggers();

    await user.click(
      screen.getByRole('button', { name: 'Notionから記事を同期' })
    );

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
  });

  it('reports the failed count when hero images sync partially fails', async () => {
    mockSyncHeroImages.mockResolvedValue({
      uploadedImages: [],
      count: 4,
      failedCount: 1,
    });
    const user = userEvent.setup();
    renderSyncTriggers();

    await user.click(
      screen.getByRole('button', { name: 'Cloudinaryから画像を同期' })
    );

    await waitFor(() =>
      expect(mockToastSuccess).toHaveBeenCalledWith(
        '画像を同期しました（4件、失敗1件）',
        expect.anything()
      )
    );
  });

  it('disables the posts button while the sync is pending', async () => {
    const neverResolves = new Promise(() => undefined);
    mockSyncPosts.mockReturnValue(neverResolves);
    const user = userEvent.setup();
    renderSyncTriggers();

    const button = screen.getByRole('button', { name: 'Notionから記事を同期' });
    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
  });
});

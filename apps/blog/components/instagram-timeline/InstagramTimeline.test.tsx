import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaType } from '../../modules/social-feed/domain';
import type { SocialPostOutput } from '../../modules/social-feed/use-cases/shared';
import { InstagramTimeline } from './InstagramTimeline';

const { mockExecute, mockLoggerError } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock('../../infrastructure/di/social-feed', () => ({
  createFetchFeedUseCase: () => ({ execute: mockExecute }),
}));

vi.mock('../../modules/social-feed/adapters/shared/logger', () => ({
  socialFeedLogger: { error: mockLoggerError },
}));

vi.mock('next/image', () => ({
  default: () => <div data-testid="instagram-image" />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const createPostFixture = (id: string): SocialPostOutput => ({
  id,
  mediaUrl: `https://example.com/${id}.jpg`,
  displayUrl: `https://example.com/${id}-display.jpg`,
  permalink: `https://instagram.com/p/${id}`,
  mediaType: MediaType.IMAGE,
  timestamp: new Date('2026-01-01T00:00:00Z'),
});

describe('InstagramTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing and logs the cause when the feed fetch fails', async () => {
    const fetchError = new Error('Instagram API is unavailable');
    mockExecute.mockRejectedValue(fetchError);

    const { container } = render(await InstagramTimeline());

    expect(container).toBeEmptyDOMElement();
    expect(mockLoggerError).toHaveBeenCalledWith(
      { err: fetchError },
      'Failed to fetch Instagram feed'
    );
  });

  it('renders the empty-state message when the feed has no posts', async () => {
    mockExecute.mockResolvedValue([]);

    render(await InstagramTimeline());

    expect(screen.getByText('新規投稿はありません')).toBeInTheDocument();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('renders a link for each post when the feed loads', async () => {
    const posts = [createPostFixture('post-1'), createPostFixture('post-2')];
    mockExecute.mockResolvedValue(posts);

    render(await InstagramTimeline());

    expect(screen.getAllByRole('link')).toHaveLength(posts.length);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});

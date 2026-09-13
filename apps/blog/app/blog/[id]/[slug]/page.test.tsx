import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPostOutput } from '../../../../modules/post/use-cases/shared/testing/factories';

import { BLOG_SITE_NAME } from '../../../siteMetadata';

import { generateMetadata } from './page';

const { defaultOgImageUrl, mockExecute } = vi.hoisted(() => ({
  defaultOgImageUrl: 'https://example.com/og.png',
  mockExecute: vi.fn(),
}));

vi.mock('../../../../infrastructure/di', () => ({
  createFetchPostUseCase: () => ({ execute: mockExecute }),
  createFetchAllSlugsUseCase: vi.fn(),
  getDefaultOgImageUrl: () => defaultOgImageUrl,
}));

const postOwnOgImageUrl = 'https://example.com/post-og.png';

describe('post page metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('titles the document after the post', async () => {
    const post = createPostOutput();
    mockExecute.mockResolvedValue({ post });
    const params = Promise.resolve({ id: post.id, slug: post.slug });
    const expectedTitle = post.title;

    const result = await generateMetadata({ params });

    expect(result.title).toBe(expectedTitle);
  });

  it('attributes the shared post to the site over Open Graph', async () => {
    const post = createPostOutput();
    mockExecute.mockResolvedValue({ post });
    const params = Promise.resolve({ id: post.id, slug: post.slug });
    const expectedOpenGraph = {
      title: post.title,
      siteName: BLOG_SITE_NAME,
    };

    const result = await generateMetadata({ params });

    expect(result.openGraph).toMatchObject(expectedOpenGraph);
  });

  it('declares the slug URL of the post as its canonical URL', async () => {
    const post = createPostOutput();
    mockExecute.mockResolvedValue({ post });
    const params = Promise.resolve({ id: post.id, slug: post.slug });
    const expectedCanonical = `/blog/${post.slug}`;

    const result = await generateMetadata({ params });

    expect(result.alternates?.canonical).toBe(expectedCanonical);
  });

  it.each([
    {
      scenario: 'falls back to the default image when the post has none',
      ogImageUrl: null,
      expectedImageUrl: defaultOgImageUrl,
    },
    {
      scenario: 'shares the own image of the post when it has one',
      ogImageUrl: postOwnOgImageUrl,
      expectedImageUrl: postOwnOgImageUrl,
    },
  ])('$scenario', async ({ ogImageUrl, expectedImageUrl }) => {
    const post = createPostOutput({ ogImageUrl });
    mockExecute.mockResolvedValue({ post });
    const params = Promise.resolve({ id: post.id, slug: post.slug });
    const expectedImages = [{ url: expectedImageUrl }];

    const result = await generateMetadata({ params });

    expect(result.openGraph).toMatchObject({ images: expectedImages });
    expect(result.twitter).toMatchObject({ images: [expectedImageUrl] });
  });
});

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Category, getCategoryDisplayName } from '../../../modules/post/domain';

import {
  BLOG_CATEGORY_DESCRIPTIONS,
  BLOG_SITE_NAME,
  LISTED_CATEGORIES,
} from '../../siteMetadata';

import Page, { generateMetadata } from './page';

const { mockCreateUseCase, mockNotFound } = vi.hoisted(() => {
  const mockExecute = vi.fn();

  return {
    mockCreateUseCase: vi.fn(() => ({ execute: mockExecute })),
    mockNotFound: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
  };
});

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

vi.mock('../../../infrastructure/di', () => ({
  getDefaultOgImageUrl: () => 'https://example.com/og.png',
  createFetchPostSummariesByCategoryUseCase: mockCreateUseCase,
}));

vi.mock('../../../components/articles/Articles', () => ({
  Articles: () => <div data-testid="articles" />,
}));

describe('category page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it.each(LISTED_CATEGORIES)(
      'returns metadata for the listed category %s',
      async (category) => {
        const params = Promise.resolve({ category });
        const searchParams = Promise.resolve({});
        const expectedTitle = getCategoryDisplayName(category);
        const expectedDescription = BLOG_CATEGORY_DESCRIPTIONS[category];
        const expectedCanonical = `/category/${category}`;
        const expectedSiteName = BLOG_SITE_NAME;

        const metadata = await generateMetadata({ params, searchParams });

        expect(metadata).toMatchObject({
          title: expectedTitle,
          description: expectedDescription,
          alternates: { canonical: expectedCanonical },
          openGraph: { siteName: expectedSiteName },
        });
        expect(mockNotFound).not.toHaveBeenCalled();
      }
    );

    it.each(['OTHER', 'not-a-category'])(
      'rejects the unlisted category %s',
      async (category) => {
        const params = Promise.resolve({ category });
        const searchParams = Promise.resolve({});
        const expectedError = 'NEXT_NOT_FOUND';

        const result = generateMetadata({ params, searchParams });

        await expect(result).rejects.toThrow(expectedError);
        expect(mockNotFound).toHaveBeenCalled();
      }
    );
  });

  describe('page', () => {
    it.each(['OTHER', 'not-a-category'])(
      'rejects the unlisted category %s before accessing data',
      async (category) => {
        const params = Promise.resolve({ category });
        const searchParams = Promise.resolve({});
        const expectedError = 'NEXT_NOT_FOUND';

        const result = Page({ params, searchParams });

        await expect(result).rejects.toThrow(expectedError);
        expect(mockCreateUseCase).not.toHaveBeenCalled();
      }
    );

    it('renders a listed category', async () => {
      const category = Category.ENGINEERING;
      const params = Promise.resolve({ category });
      const searchParams = Promise.resolve({});
      const expectedHeadingName = getCategoryDisplayName(category);

      render(await Page({ params, searchParams }));

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: expectedHeadingName,
        })
      ).toBeInTheDocument();
      expect(screen.getByTestId('articles')).toBeInTheDocument();
    });
  });
});

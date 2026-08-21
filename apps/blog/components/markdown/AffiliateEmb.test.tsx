import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AffiliateType } from '../../modules/affiliate/domain';
import type { AffiliateTextOutput } from '../../modules/affiliate/use-cases/shared';
import { AffiliateEmb } from './AffiliateEmb';

const { mockFetchAffiliate, mockFetchAffiliatesByIds, mockLoggerError } =
  vi.hoisted(() => ({
    mockFetchAffiliate: vi.fn(),
    mockFetchAffiliatesByIds: vi.fn(),
    mockLoggerError: vi.fn(),
  }));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, cache: <T,>(fn: T): T => fn };
});

vi.mock('../../infrastructure/di/affiliate', () => ({
  createFetchAffiliateUseCase: () => ({ execute: mockFetchAffiliate }),
  createFetchAffiliatesByIdsUseCase: () => ({
    execute: mockFetchAffiliatesByIds,
  }),
}));

vi.mock('../../modules/affiliate/adapters/shared/logger', () => ({
  affiliateLogger: { error: mockLoggerError },
}));

vi.mock('../cloudinary-image/CloudinaryImage', () => ({
  CloudinaryImage: () => <div data-testid="cloudinary-image" />,
}));

vi.mock('./AffiliateText', () => ({
  AffiliateText: () => <div data-testid="affiliate-text" />,
}));

const createTextAffiliateFixture = (): AffiliateTextOutput => ({
  id: 'affiliate-1',
  name: 'Sample affiliate',
  type: AffiliateType.TEXT,
  targetUrl: 'https://example.com',
  provider: 'Example',
});

describe('AffiliateEmb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing and logs the cause when the affiliate fetch fails', async () => {
    const id = 'affiliate-1';
    const fetchError = new Error('Affiliate source is unavailable');
    mockFetchAffiliate.mockRejectedValue(fetchError);

    const { container } = render(await AffiliateEmb({ id }));

    expect(container).toBeEmptyDOMElement();
    expect(mockLoggerError).toHaveBeenCalledWith(
      { err: fetchError, id },
      'Failed to fetch affiliate embed'
    );
  });

  it('renders the affiliate when the fetch succeeds', async () => {
    const affiliate = createTextAffiliateFixture();
    mockFetchAffiliate.mockResolvedValue({ affiliate });

    render(await AffiliateEmb({ id: affiliate.id }));

    expect(screen.getByTestId('affiliate-text')).toBeInTheDocument();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('renders the sub-provider link with its configured provider color', async () => {
    const subProviderColor = '#BF0000';
    mockFetchAffiliate.mockResolvedValue({
      affiliate: {
        id: 'product-1',
        name: 'Test Product',
        type: AffiliateType.PRODUCT,
        targetUrl: 'https://example.com/product',
        provider: 'Amazon',
        providerColor: '#FF9900',
        subProviderIds: ['sub-1'],
        imageProvider: 'Amazon',
        imageSourceUrl: 'https://example.com/images/product.jpg',
        imageWidth: 200,
        imageHeight: 200,
      },
    });
    mockFetchAffiliatesByIds.mockResolvedValue({
      affiliates: new Map([
        [
          'sub-1',
          {
            id: 'sub-1',
            name: 'Test SubProvider',
            type: AffiliateType.SUB_PROVIDER,
            targetUrl: 'https://example.com/subprovider',
            provider: 'Rakuten',
            providerColor: subProviderColor,
          },
        ],
      ]),
    });

    render(await AffiliateEmb({ id: 'product-1' }));

    const subProviderLink = screen.getByRole('link', { name: 'Rakuten' });
    expect(subProviderLink).toHaveStyle({ backgroundColor: subProviderColor });
  });
});

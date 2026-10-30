import { render, screen } from '@testing-library/react';
import { cacheLife } from 'next/cache';
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
  return { ...actual, cache: <T,>(fn: T) => fn };
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
      {
        err: expect.objectContaining({
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
        }),
        id,
      },
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

  it('omits the product when its sub-provider fetch fails', async () => {
    mockFetchAffiliate.mockResolvedValue({
      affiliate: {
        id: 'product-1',
        type: AffiliateType.PRODUCT,
        subProviderIds: ['sub-1'],
      },
    });
    mockFetchAffiliatesByIds.mockRejectedValue(
      new Error('Sub-provider unavailable')
    );

    const { container } = render(await AffiliateEmb({ id: 'product-1' }));

    expect(container).toBeEmptyDOMElement();
    expect(mockLoggerError).toHaveBeenCalledWith(
      {
        err: expect.objectContaining({ message: 'Sub-provider unavailable' }),
        id: 'product-1',
      },
      expect.any(String)
    );
  });

  it('renders the fetched sub-provider link with its provider name and destination', async () => {
    const subProviderUrl = 'https://example.com/subprovider';
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
            targetUrl: subProviderUrl,
            provider: 'Rakuten',
            providerColor: '#BF0000',
          },
        ],
      ]),
    });

    render(await AffiliateEmb({ id: 'product-1' }));

    const subProviderLink = screen.getByRole('link', { name: 'Rakuten' });
    expect(subProviderLink).toHaveAttribute('href', subProviderUrl);
  });

  it('uses a short cache lifetime and never hours when the dependency fails', async () => {
    mockFetchAffiliate.mockRejectedValue(new Error('Source unavailable'));
    const sut = AffiliateEmb;

    await sut({ id: 'affiliate-1' });

    expect(cacheLife).toHaveBeenCalledWith(
      expect.objectContaining({ revalidate: 60, expire: 300 })
    );
    expect(cacheLife).not.toHaveBeenCalledWith('hours');
  });

  it('uses hours when the dependency succeeds', async () => {
    mockFetchAffiliate.mockResolvedValue({
      affiliate: createTextAffiliateFixture(),
    });
    const sut = AffiliateEmb;

    await sut({ id: 'affiliate-1' });

    expect(cacheLife).toHaveBeenCalledWith('hours');
  });

  it('uses a short cache lifetime and never hours for the failed sub-provider read', async () => {
    mockFetchAffiliate.mockResolvedValue({
      affiliate: {
        id: 'product-1',
        type: AffiliateType.PRODUCT,
        subProviderIds: ['sub-1'],
      },
    });
    mockFetchAffiliatesByIds.mockRejectedValue(new Error('Source unavailable'));
    const sut = AffiliateEmb;

    await sut({ id: 'product-1' });

    expect(vi.mocked(cacheLife).mock.calls).toEqual([
      ['hours'],
      [expect.objectContaining({ revalidate: 60, expire: 300 })],
    ]);
    expect(vi.mocked(cacheLife).mock.calls.slice(1)).not.toContainEqual([
      'hours',
    ]);
  });

  it('uses hours for both the successful affiliate and sub-provider reads', async () => {
    mockFetchAffiliate.mockResolvedValue({
      affiliate: {
        id: 'product-1',
        type: AffiliateType.PRODUCT,
        subProviderIds: ['sub-1'],
      },
    });
    mockFetchAffiliatesByIds.mockResolvedValue({ affiliates: new Map() });
    const sut = AffiliateEmb;

    await sut({ id: 'product-1' });

    expect(vi.mocked(cacheLife).mock.calls).toEqual([['hours'], ['hours']]);
  });
});

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock('next/server', () => ({
  after: (callback: () => void) => callback(),
}));

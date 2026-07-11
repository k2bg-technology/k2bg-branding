import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AffiliateType } from '../../modules/affiliate/domain';
import { AffiliateEmb } from './AffiliateEmb';

const { mockFetchAffiliate, mockFetchAffiliatesByIds } = vi.hoisted(() => ({
  mockFetchAffiliate: vi.fn(),
  mockFetchAffiliatesByIds: vi.fn(),
}));

vi.mock('../../infrastructure/di/affiliate', () => ({
  createFetchAffiliateUseCase: () => ({ execute: mockFetchAffiliate }),
  createFetchAffiliatesByIdsUseCase: () => ({
    execute: mockFetchAffiliatesByIds,
  }),
}));

vi.mock('../cloudinary-image/CloudinaryImage', () => ({
  CloudinaryImage: () => <div data-testid="cloudinary-image" />,
}));

describe('AffiliateEmb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

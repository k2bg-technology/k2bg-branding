import { describe, expect, it } from 'vitest';

import {
  AffiliateId,
  ImageHeight,
  ImageProvider,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  ProviderColor,
  SubProviderIds,
  TargetUrl,
} from '../value-objects';

import { AffiliateProduct, type AffiliateProductProps } from './product';

function createValidProductProps(
  overrides: Partial<AffiliateProductProps> = {}
): AffiliateProductProps {
  return {
    id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('Product Name'),
    targetUrl: TargetUrl.create('https://example.com/product'),
    provider: Provider.create('Amazon'),
    providerColor: ProviderColor.create('#FF9900'),
    subProviderIds: SubProviderIds.create([
      '660f9500-f30c-42e5-b827-557766551111',
    ]),
    imageProvider: ImageProvider.create('Amazon'),
    imageSourceUrl: ImageSourceUrl.create(
      'https://images.example.com/product.jpg'
    ),
    imageWidth: ImageWidth.create(500),
    imageHeight: ImageHeight.create(500),
    ...overrides,
  };
}

describe('AffiliateProduct', () => {
  describe('hasSubProviders', () => {
    it('returns true when sub providers exist', () => {
      const sut = AffiliateProduct.create(createValidProductProps());

      expect(sut.hasSubProviders()).toBe(true);
    });

    it('returns false when no sub providers', () => {
      const sut = AffiliateProduct.create(
        createValidProductProps({ subProviderIds: SubProviderIds.empty() })
      );

      expect(sut.hasSubProviders()).toBe(false);
    });
  });
});

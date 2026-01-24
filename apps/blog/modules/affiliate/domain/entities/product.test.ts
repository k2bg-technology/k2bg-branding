import { describe, expect, it } from 'vitest';

import { AffiliateType } from '../types/enums';
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
  describe('create', () => {
    it('creates AffiliateProduct with valid props', () => {
      const props = createValidProductProps();

      const sut = AffiliateProduct.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.name.equals(props.name)).toBe(true);
      expect(sut.targetUrl.equals(props.targetUrl)).toBe(true);
      expect(sut.provider.equals(props.provider)).toBe(true);
      expect(sut.providerColor.equals(props.providerColor)).toBe(true);
      expect(sut.subProviderIds.equals(props.subProviderIds)).toBe(true);
      expect(sut.imageProvider.equals(props.imageProvider)).toBe(true);
      expect(sut.imageSourceUrl.equals(props.imageSourceUrl)).toBe(true);
      expect(sut.imageWidth.equals(props.imageWidth)).toBe(true);
      expect(sut.imageHeight.equals(props.imageHeight)).toBe(true);
    });
  });

  describe('type', () => {
    it('returns PRODUCT as affiliate type', () => {
      const sut = AffiliateProduct.create(createValidProductProps());

      expect(sut.type).toBe(AffiliateType.PRODUCT);
    });
  });

  describe('providerColor', () => {
    it('returns correct provider color', () => {
      const color = ProviderColor.create('#BF0000');
      const sut = AffiliateProduct.create(
        createValidProductProps({ providerColor: color })
      );

      expect(sut.providerColor.equals(color)).toBe(true);
    });
  });

  describe('subProviderIds', () => {
    it('returns correct sub provider IDs', () => {
      const subIds = SubProviderIds.create([
        '660f9500-f30c-42e5-b827-557766551111',
        '770f9500-f30c-42e5-b827-557766552222',
      ]);
      const sut = AffiliateProduct.create(
        createValidProductProps({ subProviderIds: subIds })
      );

      expect(sut.subProviderIds.count()).toBe(2);
    });

    it('returns empty sub provider IDs when none provided', () => {
      const sut = AffiliateProduct.create(
        createValidProductProps({ subProviderIds: SubProviderIds.empty() })
      );

      expect(sut.subProviderIds.isEmpty()).toBe(true);
    });
  });

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

  describe('image properties', () => {
    it('returns correct image provider', () => {
      const imgProvider = ImageProvider.create('Rakuten');
      const sut = AffiliateProduct.create(
        createValidProductProps({ imageProvider: imgProvider })
      );

      expect(sut.imageProvider.equals(imgProvider)).toBe(true);
    });

    it('returns correct image source URL', () => {
      const imageUrl = ImageSourceUrl.create(
        'https://cdn.example.com/item.png'
      );
      const sut = AffiliateProduct.create(
        createValidProductProps({ imageSourceUrl: imageUrl })
      );

      expect(sut.imageSourceUrl.equals(imageUrl)).toBe(true);
    });

    it('returns correct image dimensions', () => {
      const width = ImageWidth.create(400);
      const height = ImageHeight.create(300);
      const sut = AffiliateProduct.create(
        createValidProductProps({ imageWidth: width, imageHeight: height })
      );

      expect(sut.imageWidth.getValue()).toBe(400);
      expect(sut.imageHeight.getValue()).toBe(300);
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes AffiliateProduct from persisted data', () => {
      const props = createValidProductProps();

      const sut = AffiliateProduct.reconstitute(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.type).toBe(AffiliateType.PRODUCT);
      expect(sut.providerColor.equals(props.providerColor)).toBe(true);
      expect(sut.hasSubProviders()).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true when comparing same products', () => {
      const id = AffiliateId.create('550e8400-e29b-41d4-a716-446655440000');
      const product1 = AffiliateProduct.create(createValidProductProps({ id }));
      const product2 = AffiliateProduct.create(createValidProductProps({ id }));

      expect(product1.equals(product2)).toBe(true);
    });

    it('returns false when comparing different products', () => {
      const product1 = AffiliateProduct.create(
        createValidProductProps({
          id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const product2 = AffiliateProduct.create(
        createValidProductProps({
          id: AffiliateId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      expect(product1.equals(product2)).toBe(false);
    });
  });
});

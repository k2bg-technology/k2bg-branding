import { describe, expect, it } from 'vitest';

import { AffiliateType } from '../types/enums';
import {
  AffiliateId,
  ImageHeight,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  TargetUrl,
} from '../value-objects';

import { AffiliateBanner, type AffiliateBannerProps } from './banner';

function createValidBannerProps(
  overrides: Partial<AffiliateBannerProps> = {}
): AffiliateBannerProps {
  return {
    id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('Banner Ad'),
    targetUrl: TargetUrl.create('https://example.com/affiliate'),
    provider: Provider.create('Amazon'),
    imageSourceUrl: ImageSourceUrl.create(
      'https://images.example.com/banner.jpg'
    ),
    imageWidth: ImageWidth.create(300),
    imageHeight: ImageHeight.create(250),
    ...overrides,
  };
}

describe('AffiliateBanner', () => {
  describe('create', () => {
    it('creates AffiliateBanner with valid props', () => {
      const props = createValidBannerProps();

      const sut = AffiliateBanner.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.name.equals(props.name)).toBe(true);
      expect(sut.targetUrl.equals(props.targetUrl)).toBe(true);
      expect(sut.provider.equals(props.provider)).toBe(true);
      expect(sut.imageSourceUrl.equals(props.imageSourceUrl)).toBe(true);
      expect(sut.imageWidth.equals(props.imageWidth)).toBe(true);
      expect(sut.imageHeight.equals(props.imageHeight)).toBe(true);
    });
  });

  describe('type', () => {
    it('returns BANNER as affiliate type', () => {
      const sut = AffiliateBanner.create(createValidBannerProps());

      expect(sut.type).toBe(AffiliateType.BANNER);
    });
  });

  describe('image properties', () => {
    it('returns correct image source URL', () => {
      const imageUrl = ImageSourceUrl.create('https://cdn.example.com/ad.png');
      const sut = AffiliateBanner.create(
        createValidBannerProps({ imageSourceUrl: imageUrl })
      );

      expect(sut.imageSourceUrl.equals(imageUrl)).toBe(true);
    });

    it('returns correct image dimensions', () => {
      const width = ImageWidth.create(728);
      const height = ImageHeight.create(90);
      const sut = AffiliateBanner.create(
        createValidBannerProps({ imageWidth: width, imageHeight: height })
      );

      expect(sut.imageWidth.getValue()).toBe(728);
      expect(sut.imageHeight.getValue()).toBe(90);
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes AffiliateBanner from persisted data', () => {
      const props = createValidBannerProps();

      const sut = AffiliateBanner.reconstitute(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.type).toBe(AffiliateType.BANNER);
      expect(sut.imageSourceUrl.equals(props.imageSourceUrl)).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true when comparing same banners', () => {
      const id = AffiliateId.create('550e8400-e29b-41d4-a716-446655440000');
      const banner1 = AffiliateBanner.create(createValidBannerProps({ id }));
      const banner2 = AffiliateBanner.create(createValidBannerProps({ id }));

      expect(banner1.equals(banner2)).toBe(true);
    });

    it('returns false when comparing different banners', () => {
      const banner1 = AffiliateBanner.create(
        createValidBannerProps({
          id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const banner2 = AffiliateBanner.create(
        createValidBannerProps({
          id: AffiliateId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      expect(banner1.equals(banner2)).toBe(false);
    });
  });
});

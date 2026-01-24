import { describe, expect, it } from 'vitest';

import {
  AffiliateBanner,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
  AffiliateType,
} from '../../../../domain';
import { DEFAULT_VALUES, MappingError } from '../../../shared';
import { createNotionAffiliatePageResponse } from '../../../shared/testing';

import {
  determineAffiliateType,
  notionPageToAffiliate,
  notionPageToImageSource,
} from './mapper';

describe('affiliate/adapters/mapper', () => {
  describe('determineAffiliateType', () => {
    it.each([
      { input: 'AFFILIATE_BANNER' as const, expected: AffiliateType.BANNER },
      { input: 'AFFILIATE_PRODUCT' as const, expected: AffiliateType.PRODUCT },
      { input: 'AFFILIATE_TEXT' as const, expected: AffiliateType.TEXT },
      {
        input: 'AFFILIATE_SUB_PROVIDER' as const,
        expected: AffiliateType.SUB_PROVIDER,
      },
    ])('returns $expected for $input', ({ input, expected }) => {
      const page = createNotionAffiliatePageResponse({
        type: input,
      });

      const result = determineAffiliateType(page);

      expect(result).toBe(expected);
    });

    it('returns null for unknown type', () => {
      const page = createNotionAffiliatePageResponse();
      // Override the type property to an unknown value
      (page.properties.type as { select: { name: string } | null }).select = {
        name: 'UNKNOWN_TYPE',
      };

      const result = determineAffiliateType(page);

      expect(result).toBeNull();
    });

    it('returns null when type select is null', () => {
      const page = createNotionAffiliatePageResponse();
      (page.properties.type as { select: null }).select = null;

      const result = determineAffiliateType(page);

      expect(result).toBeNull();
    });
  });

  describe('notionPageToAffiliate', () => {
    describe('Banner mapping', () => {
      it('maps all Banner properties correctly', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_BANNER',
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Banner',
          targetUrl: 'https://example.com/banner-target',
          provider: 'Amazon',
          imageSourceUrl: 'https://example.com/banner-image.jpg',
          imageWidth: 728,
          imageHeight: 90,
        });

        const result = notionPageToAffiliate(page);

        expect(result).toBeInstanceOf(AffiliateBanner);
        expect(result.type).toBe(AffiliateType.BANNER);
        expect(result.id.getValue()).toBe(
          '550e8400-e29b-41d4-a716-446655440001'
        );
        expect(result.name.getValue()).toBe('Test Banner');
        expect(result.targetUrl.getValue()).toBe(
          'https://example.com/banner-target'
        );
        expect(result.provider.getValue()).toBe('Amazon');

        const banner = result as AffiliateBanner;
        expect(banner.imageSourceUrl.getValue()).toBe(
          'https://example.com/banner-image.jpg'
        );
        expect(banner.imageWidth.getValue()).toBe(728);
        expect(banner.imageHeight.getValue()).toBe(90);
      });

      it('prioritizes imageSourceFile over imageSourceUrl', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_BANNER',
          imageSourceFile: 'https://s3.example.com/uploaded-file.jpg',
          imageSourceUrl: 'https://example.com/url-image.jpg',
        });

        const result = notionPageToAffiliate(page) as AffiliateBanner;

        expect(result.imageSourceUrl.getValue()).toBe(
          'https://s3.example.com/uploaded-file.jpg'
        );
      });

      it('falls back to imageSourceUrl when imageSourceFile is empty', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_BANNER',
          imageSourceUrl: 'https://example.com/fallback.jpg',
        });

        const result = notionPageToAffiliate(page) as AffiliateBanner;

        expect(result.imageSourceUrl.getValue()).toBe(
          'https://example.com/fallback.jpg'
        );
      });

      it('uses default dimensions when not specified', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_BANNER',
        });
        // Override to null
        (page.properties.imageWidth as { number: null }).number = null;
        (page.properties.imageHeight as { number: null }).number = null;

        const result = notionPageToAffiliate(page) as AffiliateBanner;

        expect(result.imageWidth.getValue()).toBe(
          DEFAULT_VALUES.DEFAULT_IMAGE_WIDTH
        );
        expect(result.imageHeight.getValue()).toBe(
          DEFAULT_VALUES.DEFAULT_IMAGE_HEIGHT
        );
      });
    });

    describe('Product mapping', () => {
      it('maps all Product properties correctly', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_PRODUCT',
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Test Product',
          targetUrl: 'https://example.com/product-target',
          provider: 'Rakuten',
          providerColor: '#BF0000',
          imageProvider: 'Amazon',
          imageSourceUrl: 'https://example.com/product-image.jpg',
          imageWidth: 150,
          imageHeight: 150,
          subProviders: [
            '660e8400-e29b-41d4-a716-446655440001',
            '660e8400-e29b-41d4-a716-446655440002',
          ],
        });

        const result = notionPageToAffiliate(page);

        expect(result).toBeInstanceOf(AffiliateProduct);
        expect(result.type).toBe(AffiliateType.PRODUCT);

        const product = result as AffiliateProduct;
        expect(product.providerColor.getValue()).toBe('#BF0000');
        expect(product.imageProvider.getValue()).toBe('Amazon');
        expect(product.subProviderIds.getValues()).toEqual([
          '660e8400-e29b-41d4-a716-446655440001',
          '660e8400-e29b-41d4-a716-446655440002',
        ]);
        expect(product.imageSourceUrl.getValue()).toBe(
          'https://example.com/product-image.jpg'
        );
        expect(product.imageWidth.getValue()).toBe(150);
        expect(product.imageHeight.getValue()).toBe(150);
      });

      it('handles empty subProviders array', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_PRODUCT',
          subProviders: [],
        });

        const result = notionPageToAffiliate(page) as AffiliateProduct;

        expect(result.subProviderIds.isEmpty()).toBe(true);
        expect(result.hasSubProviders()).toBe(false);
      });

      it('uses provider as default imageProvider when not specified', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_PRODUCT',
          provider: 'Yahoo',
        });
        // Override imageProvider to null
        (page.properties.imageProvider as { select: null }).select = null;

        const result = notionPageToAffiliate(page) as AffiliateProduct;

        expect(result.imageProvider.getValue()).toBe('Yahoo');
      });

      it('prioritizes imageSourceFile over imageSourceUrl for Product', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_PRODUCT',
          imageSourceFile: 'https://s3.example.com/product-file.jpg',
          imageSourceUrl: 'https://example.com/product-url.jpg',
        });

        const result = notionPageToAffiliate(page) as AffiliateProduct;

        expect(result.imageSourceUrl.getValue()).toBe(
          'https://s3.example.com/product-file.jpg'
        );
      });
    });

    describe('Text mapping', () => {
      it('maps core properties only', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_TEXT',
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Test Text Link',
          targetUrl: 'https://example.com/text-target',
          provider: 'a8net',
        });

        const result = notionPageToAffiliate(page);

        expect(result).toBeInstanceOf(AffiliateText);
        expect(result.type).toBe(AffiliateType.TEXT);
        expect(result.id.getValue()).toBe(
          '550e8400-e29b-41d4-a716-446655440003'
        );
        expect(result.name.getValue()).toBe('Test Text Link');
        expect(result.targetUrl.getValue()).toBe(
          'https://example.com/text-target'
        );
        expect(result.provider.getValue()).toBe('a8net');
      });
    });

    describe('SubProvider mapping', () => {
      it('maps core properties and providerColor', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_SUB_PROVIDER',
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Rakuten Sub Provider',
          targetUrl: 'https://example.com/rakuten-target',
          provider: 'Rakuten',
          providerColor: '#BF0000',
        });

        const result = notionPageToAffiliate(page);

        expect(result).toBeInstanceOf(AffiliateSubProvider);
        expect(result.type).toBe(AffiliateType.SUB_PROVIDER);

        const subProvider = result as AffiliateSubProvider;
        expect(subProvider.providerColor.getValue()).toBe('#BF0000');
      });

      it('uses default providerColor when not specified', () => {
        const page = createNotionAffiliatePageResponse({
          type: 'AFFILIATE_SUB_PROVIDER',
        });
        (page.properties.providerColor as { select: null }).select = null;

        const result = notionPageToAffiliate(page) as AffiliateSubProvider;

        expect(result.providerColor.getValue()).toBe(
          DEFAULT_VALUES.DEFAULT_PROVIDER_COLOR
        );
      });
    });

    it('throws MappingError for unknown type', () => {
      const page = createNotionAffiliatePageResponse();
      (page.properties.type as { select: { name: string } | null }).select = {
        name: 'UNKNOWN_TYPE',
      };

      expect(() => notionPageToAffiliate(page)).toThrow(MappingError);
      expect(() => notionPageToAffiliate(page)).toThrow(
        /Unknown affiliate type/
      );
    });
  });

  describe('notionPageToImageSource', () => {
    it('returns ImageSource for Banner type', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        imageSourceUrl: 'https://example.com/banner.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result?.url.getValue()).toBe('https://example.com/banner.jpg');
    });

    it('returns ImageSource for Product type', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_PRODUCT',
        id: '550e8400-e29b-41d4-a716-446655440002',
        imageSourceUrl: 'https://example.com/product.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440002'
      );
      expect(result?.url.getValue()).toBe('https://example.com/product.jpg');
    });

    it('returns null for Text type', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_TEXT',
      });

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('returns null for SubProvider type', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_SUB_PROVIDER',
      });

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('returns null when no image URL exists', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
      });
      // Remove image URLs
      (page.properties.imageSourceFile as unknown as { files: [] }).files = [];
      (page.properties.imageSourceUrl as unknown as { url: null }).url = null;

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('prioritizes imageSourceFile over imageSourceUrl', () => {
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        imageSourceFile: 'https://s3.example.com/file.jpg',
        imageSourceUrl: 'https://example.com/url.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result?.url.getValue()).toBe('https://s3.example.com/file.jpg');
    });
  });
});

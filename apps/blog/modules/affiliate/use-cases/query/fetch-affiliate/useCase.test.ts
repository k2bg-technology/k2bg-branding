import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type AffiliateRepository, AffiliateType } from '../../../domain';
import { AffiliateNotFoundError } from '../../shared';
import {
  createAffiliateBanner,
  createAffiliateProduct,
  createAffiliateSubProvider,
  createAffiliateText,
  resetFactoryCounter,
} from '../../shared/testing/factories';
import { FetchAffiliate } from './useCase';

describe('FetchAffiliate', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  const createMockRepository = (
    overrides: Partial<AffiliateRepository> = {}
  ): AffiliateRepository => ({
    findById: vi.fn().mockResolvedValue(null),
    findByIds: vi.fn().mockResolvedValue(new Map()),
    findAllImageSources: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

  describe('execute', () => {
    it('returns banner affiliate when found', async () => {
      const banner = createAffiliateBanner();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(banner),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: banner.id.getValue() });

      expect(result.affiliate.id).toBe(banner.id.getValue());
      expect(result.affiliate.name).toBe(banner.name.getValue());
      expect(result.affiliate.type).toBe(AffiliateType.BANNER);
    });

    it('returns product affiliate when found', async () => {
      const product = createAffiliateProduct();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(product),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: product.id.getValue() });

      expect(result.affiliate.id).toBe(product.id.getValue());
      expect(result.affiliate.type).toBe(AffiliateType.PRODUCT);
    });

    it('returns text affiliate when found', async () => {
      const text = createAffiliateText();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(text),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: text.id.getValue() });

      expect(result.affiliate.id).toBe(text.id.getValue());
      expect(result.affiliate.type).toBe(AffiliateType.TEXT);
    });

    it('returns subProvider affiliate when found', async () => {
      const subProvider = createAffiliateSubProvider();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(subProvider),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: subProvider.id.getValue() });

      expect(result.affiliate.id).toBe(subProvider.id.getValue());
      expect(result.affiliate.type).toBe(AffiliateType.SUB_PROVIDER);
    });

    it('throws AffiliateNotFoundError when affiliate does not exist', async () => {
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchAffiliate(repository);

      await expect(
        sut.execute({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toThrow(AffiliateNotFoundError);
    });

    it('calls repository with correct AffiliateId', async () => {
      const banner = createAffiliateBanner();
      const findById = vi.fn().mockResolvedValue(banner);
      const repository = createMockRepository({ findById });
      const sut = new FetchAffiliate(repository);

      await sut.execute({ id: banner.id.getValue() });

      expect(findById).toHaveBeenCalledTimes(1);
      const calledId = findById.mock.calls[0][0];
      expect(calledId.getValue()).toBe(banner.id.getValue());
    });

    it('maps banner affiliate output correctly', async () => {
      const banner = createAffiliateBanner();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(banner),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: banner.id.getValue() });

      if (result.affiliate.type !== AffiliateType.BANNER) {
        throw new Error('Expected banner type');
      }
      expect(result.affiliate.imageSourceUrl).toBe(
        banner.imageSourceUrl.getValue()
      );
      expect(result.affiliate.imageWidth).toBe(banner.imageWidth.getValue());
      expect(result.affiliate.imageHeight).toBe(banner.imageHeight.getValue());
    });

    it('maps product affiliate output correctly', async () => {
      const product = createAffiliateProduct();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(product),
      });
      const sut = new FetchAffiliate(repository);

      const result = await sut.execute({ id: product.id.getValue() });

      if (result.affiliate.type !== AffiliateType.PRODUCT) {
        throw new Error('Expected product type');
      }
      expect(result.affiliate.providerColor).toBe(
        product.providerColor.getValue()
      );
      expect(result.affiliate.imageProvider).toBe(
        product.imageProvider.getValue()
      );
    });
  });
});

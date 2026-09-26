import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Affiliate,
  type AffiliateRepository,
  AffiliateType,
} from '../../../domain';
import {
  createAffiliateBanner,
  createAffiliateSubProvider,
  resetFactoryCounter,
} from '../../shared/testing/factories';
import { FetchAffiliatesByIds } from './useCase';

describe('FetchAffiliatesByIds', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  const createMockRepository = (
    overrides: Partial<AffiliateRepository> = {}
  ): AffiliateRepository => ({
    findById: vi.fn().mockResolvedValue(null),
    findByIds: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  });

  describe('execute', () => {
    it('returns empty map when ids array is empty', async () => {
      const repository = createMockRepository();
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({ ids: [] });

      expect(result.affiliates.size).toBe(0);
      expect(repository.findByIds).not.toHaveBeenCalled();
    });

    it('returns affiliates when found', async () => {
      const banner = createAffiliateBanner();
      const subProvider = createAffiliateSubProvider();
      const affiliatesMap = new Map<string, Affiliate>([
        [banner.id.getValue(), banner],
        [subProvider.id.getValue(), subProvider],
      ]);

      const repository = createMockRepository({
        findByIds: vi.fn().mockResolvedValue(affiliatesMap),
      });
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({
        ids: [banner.id.getValue(), subProvider.id.getValue()],
      });

      expect(result.affiliates.size).toBe(2);
      expect(result.affiliates.get(banner.id.getValue())?.type).toBe(
        AffiliateType.BANNER
      );
      expect(result.affiliates.get(subProvider.id.getValue())?.type).toBe(
        AffiliateType.SUB_PROVIDER
      );
    });

    it('returns partial results when some affiliates are not found', async () => {
      const banner = createAffiliateBanner();
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      const affiliatesMap = new Map([[banner.id.getValue(), banner]]);

      const repository = createMockRepository({
        findByIds: vi.fn().mockResolvedValue(affiliatesMap),
      });
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({
        ids: [banner.id.getValue(), nonExistentId],
      });

      expect(result.affiliates.size).toBe(1);
      expect(result.affiliates.has(banner.id.getValue())).toBe(true);
      expect(result.affiliates.has(nonExistentId)).toBe(false);
    });

    it('maps affiliate output correctly', async () => {
      const banner = createAffiliateBanner();
      const affiliatesMap = new Map([[banner.id.getValue(), banner]]);

      const repository = createMockRepository({
        findByIds: vi.fn().mockResolvedValue(affiliatesMap),
      });
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({ ids: [banner.id.getValue()] });

      const output = result.affiliates.get(banner.id.getValue());
      expect(output?.id).toBe(banner.id.getValue());
      expect(output?.name).toBe(banner.name.getValue());
      if (output?.type !== AffiliateType.BANNER) {
        throw new Error('Expected banner type');
      }
      expect(output.imageSourceUrl).toBe(banner.imageSourceUrl.getValue());
    });
  });
});

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
    findAllImageSources: vi.fn().mockResolvedValue([]),
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
      const affiliatesMap = new Map([[banner.id.getValue(), banner]]);

      const repository = createMockRepository({
        findByIds: vi.fn().mockResolvedValue(affiliatesMap),
      });
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({
        ids: [banner.id.getValue(), 'non-existent-id'],
      });

      expect(result.affiliates.size).toBe(1);
      expect(result.affiliates.has(banner.id.getValue())).toBe(true);
      expect(result.affiliates.has('non-existent-id')).toBe(false);
    });

    it('calls repository with correct AffiliateIds', async () => {
      const findByIds = vi.fn().mockResolvedValue(new Map());
      const repository = createMockRepository({ findByIds });
      const sut = new FetchAffiliatesByIds(repository);

      const ids = [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ];
      await sut.execute({ ids });

      expect(findByIds).toHaveBeenCalledTimes(1);
      const calledIds = findByIds.mock.calls[0][0];
      expect(calledIds).toHaveLength(2);
      expect(calledIds[0].getValue()).toBe(ids[0]);
      expect(calledIds[1].getValue()).toBe(ids[1]);
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

    it('accepts readonly string array', async () => {
      const repository = createMockRepository();
      const sut = new FetchAffiliatesByIds(repository);

      const readonlyIds: readonly string[] = ['id1', 'id2'] as const;
      const result = await sut.execute({ ids: readonlyIds });

      expect(result.affiliates).toBeDefined();
    });
  });
});

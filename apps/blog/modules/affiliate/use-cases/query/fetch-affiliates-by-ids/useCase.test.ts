import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Affiliate,
  AffiliateId,
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

    it('returns only the affiliates selected by the requested IDs', async () => {
      const bannerId = '550e8400-e29b-41d4-a716-446655440001';
      const subProviderId = '550e8400-e29b-41d4-a716-446655440002';
      const banner = createAffiliateBanner({
        id: AffiliateId.create(bannerId),
      });
      const subProvider = createAffiliateSubProvider({
        id: AffiliateId.create(subProviderId),
      });
      const other = createAffiliateBanner({
        id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440003'),
      });
      const records = new Map<string, Affiliate>([
        [other.id.getValue(), other],
        [bannerId, banner],
        [subProviderId, subProvider],
      ]);
      const repository = createMockRepository({
        findByIds: async (ids) => {
          const requestedIds = new Set(ids.map((id) => id.getValue()));
          return new Map(
            Array.from(records).filter(([id]) => requestedIds.has(id))
          );
        },
      });
      const sut = new FetchAffiliatesByIds(repository);

      const result = await sut.execute({ ids: [bannerId, subProviderId] });

      expect(Array.from(result.affiliates.values())).toEqual([
        expect.objectContaining({ id: bannerId, type: AffiliateType.BANNER }),
        expect.objectContaining({
          id: subProviderId,
          type: AffiliateType.SUB_PROVIDER,
        }),
      ]);
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

      const readonlyIds: readonly string[] = [
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
      ] as const;
      const result = await sut.execute({ ids: readonlyIds });

      expect(result.affiliates).toBeDefined();
    });
  });
});

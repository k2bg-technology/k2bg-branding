import { describe, expect, it } from 'vitest';

import { AffiliateType } from '../types/enums';
import {
  AffiliateId,
  Name,
  Provider,
  ProviderColor,
  TargetUrl,
} from '../value-objects';

import {
  AffiliateSubProvider,
  type AffiliateSubProviderProps,
} from './subProvider';

function createValidSubProviderProps(
  overrides: Partial<AffiliateSubProviderProps> = {}
): AffiliateSubProviderProps {
  return {
    id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('Sub Provider Link'),
    targetUrl: TargetUrl.create('https://example.com/affiliate'),
    provider: Provider.create('Rakuten'),
    providerColor: ProviderColor.create('#FF5733'),
    ...overrides,
  };
}

describe('AffiliateSubProvider', () => {
  describe('create', () => {
    it('creates AffiliateSubProvider with valid props', () => {
      const props = createValidSubProviderProps();

      const sut = AffiliateSubProvider.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.name.equals(props.name)).toBe(true);
      expect(sut.targetUrl.equals(props.targetUrl)).toBe(true);
      expect(sut.provider.equals(props.provider)).toBe(true);
      expect(sut.providerColor.equals(props.providerColor)).toBe(true);
    });
  });

  describe('type', () => {
    it('returns SUB_PROVIDER as affiliate type', () => {
      const sut = AffiliateSubProvider.create(createValidSubProviderProps());

      expect(sut.type).toBe(AffiliateType.SUB_PROVIDER);
    });
  });

  describe('providerColor', () => {
    it('returns correct provider color', () => {
      const color = ProviderColor.create('#00FF00');
      const sut = AffiliateSubProvider.create(
        createValidSubProviderProps({ providerColor: color })
      );

      expect(sut.providerColor.equals(color)).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes AffiliateSubProvider from persisted data', () => {
      const props = createValidSubProviderProps();

      const sut = AffiliateSubProvider.reconstitute(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.type).toBe(AffiliateType.SUB_PROVIDER);
      expect(sut.providerColor.equals(props.providerColor)).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true when comparing same sub providers', () => {
      const id = AffiliateId.create('550e8400-e29b-41d4-a716-446655440000');
      const sub1 = AffiliateSubProvider.create(
        createValidSubProviderProps({ id })
      );
      const sub2 = AffiliateSubProvider.create(
        createValidSubProviderProps({ id })
      );

      expect(sub1.equals(sub2)).toBe(true);
    });

    it('returns false when comparing different sub providers', () => {
      const sub1 = AffiliateSubProvider.create(
        createValidSubProviderProps({
          id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const sub2 = AffiliateSubProvider.create(
        createValidSubProviderProps({
          id: AffiliateId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      expect(sub1.equals(sub2)).toBe(false);
    });
  });
});

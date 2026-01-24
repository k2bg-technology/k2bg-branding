import { describe, expect, it } from 'vitest';

import { AffiliateType } from '../types/enums';
import { AffiliateId, Name, Provider, TargetUrl } from '../value-objects';

import { AffiliateCore, type CoreProps } from './core';

// Concrete implementation for testing abstract class
class TestAffiliate extends AffiliateCore {
  private constructor(
    _id: AffiliateId,
    _name: Name,
    _targetUrl: TargetUrl,
    _provider: Provider
  ) {
    super(_id, _name, _targetUrl, _provider);
  }

  get type(): AffiliateType {
    return AffiliateType.TEXT;
  }

  static create(props: CoreProps): TestAffiliate {
    return new TestAffiliate(
      props.id,
      props.name,
      props.targetUrl,
      props.provider
    );
  }
}

function createValidCoreProps(overrides: Partial<CoreProps> = {}): CoreProps {
  return {
    id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('Test Affiliate'),
    targetUrl: TargetUrl.create('https://example.com/affiliate'),
    provider: Provider.create('Amazon'),
    ...overrides,
  };
}

describe('AffiliateCore', () => {
  describe('properties', () => {
    it('returns correct id', () => {
      const props = createValidCoreProps();
      const sut = TestAffiliate.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
    });

    it('returns correct name', () => {
      const props = createValidCoreProps();
      const sut = TestAffiliate.create(props);

      expect(sut.name.equals(props.name)).toBe(true);
    });

    it('returns correct targetUrl', () => {
      const props = createValidCoreProps();
      const sut = TestAffiliate.create(props);

      expect(sut.targetUrl.equals(props.targetUrl)).toBe(true);
    });

    it('returns correct provider', () => {
      const props = createValidCoreProps();
      const sut = TestAffiliate.create(props);

      expect(sut.provider.equals(props.provider)).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true when comparing affiliates with same id', () => {
      const id = AffiliateId.create('550e8400-e29b-41d4-a716-446655440000');
      const affiliate1 = TestAffiliate.create(createValidCoreProps({ id }));
      const affiliate2 = TestAffiliate.create(
        createValidCoreProps({
          id,
          name: Name.create('Different Name'),
        })
      );

      const result = affiliate1.equals(affiliate2);

      expect(result).toBe(true);
    });

    it('returns false when comparing affiliates with different ids', () => {
      const affiliate1 = TestAffiliate.create(
        createValidCoreProps({
          id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const affiliate2 = TestAffiliate.create(
        createValidCoreProps({
          id: AffiliateId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      const result = affiliate1.equals(affiliate2);

      expect(result).toBe(false);
    });
  });
});

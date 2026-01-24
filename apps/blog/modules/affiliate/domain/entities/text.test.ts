import { describe, expect, it } from 'vitest';

import { AffiliateType } from '../types/enums';
import { AffiliateId, Name, Provider, TargetUrl } from '../value-objects';

import { AffiliateText, type AffiliateTextProps } from './text';

function createValidTextProps(
  overrides: Partial<AffiliateTextProps> = {}
): AffiliateTextProps {
  return {
    id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('Text Affiliate Link'),
    targetUrl: TargetUrl.create('https://example.com/affiliate'),
    provider: Provider.create('Amazon'),
    ...overrides,
  };
}

describe('AffiliateText', () => {
  describe('create', () => {
    it('creates AffiliateText with valid props', () => {
      const props = createValidTextProps();

      const sut = AffiliateText.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.name.equals(props.name)).toBe(true);
      expect(sut.targetUrl.equals(props.targetUrl)).toBe(true);
      expect(sut.provider.equals(props.provider)).toBe(true);
    });
  });

  describe('type', () => {
    it('returns TEXT as affiliate type', () => {
      const sut = AffiliateText.create(createValidTextProps());

      expect(sut.type).toBe(AffiliateType.TEXT);
    });
  });

  describe('reconstitute', () => {
    it('reconstitutes AffiliateText from persisted data', () => {
      const props = createValidTextProps();

      const sut = AffiliateText.reconstitute(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.type).toBe(AffiliateType.TEXT);
    });
  });

  describe('equals', () => {
    it('returns true when comparing same text affiliates', () => {
      const id = AffiliateId.create('550e8400-e29b-41d4-a716-446655440000');
      const text1 = AffiliateText.create(createValidTextProps({ id }));
      const text2 = AffiliateText.create(createValidTextProps({ id }));

      expect(text1.equals(text2)).toBe(true);
    });

    it('returns false when comparing different text affiliates', () => {
      const text1 = AffiliateText.create(
        createValidTextProps({
          id: AffiliateId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const text2 = AffiliateText.create(
        createValidTextProps({
          id: AffiliateId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      expect(text1.equals(text2)).toBe(false);
    });
  });
});

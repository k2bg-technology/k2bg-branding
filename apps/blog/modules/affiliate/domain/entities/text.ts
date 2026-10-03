import { AffiliateType } from '../types/enums';
import type { AffiliateId, Name, Provider, TargetUrl } from '../value-objects';

import { AffiliateCore, type CoreProps } from './core';

export type AffiliateTextProps = CoreProps;

export class AffiliateText extends AffiliateCore {
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

  static create(props: AffiliateTextProps): AffiliateText {
    return new AffiliateText(
      props.id,
      props.name,
      props.targetUrl,
      props.provider
    );
  }

  static reconstitute(props: AffiliateTextProps): AffiliateText {
    return new AffiliateText(
      props.id,
      props.name,
      props.targetUrl,
      props.provider
    );
  }
}

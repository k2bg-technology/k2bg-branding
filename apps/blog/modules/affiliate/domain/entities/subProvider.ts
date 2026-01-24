import { AffiliateType } from '../types/enums';
import type {
  AffiliateId,
  Name,
  Provider,
  ProviderColor,
  TargetUrl,
} from '../value-objects';

import { AffiliateCore, type CoreProps } from './core';

/**
 * Props for creating an AffiliateSubProvider entity
 */
export interface AffiliateSubProviderProps extends CoreProps {
  providerColor: ProviderColor;
}

/**
 * AffiliateSubProvider Entity
 *
 * Represents an auxiliary provider linked to a Product affiliate.
 * Used when promoting the same product across multiple affiliate services.
 */
export class AffiliateSubProvider extends AffiliateCore {
  private constructor(
    _id: AffiliateId,
    _name: Name,
    _targetUrl: TargetUrl,
    _provider: Provider,
    private readonly _providerColor: ProviderColor
  ) {
    super(_id, _name, _targetUrl, _provider);
  }

  get type(): AffiliateType {
    return AffiliateType.SUB_PROVIDER;
  }

  get providerColor(): ProviderColor {
    return this._providerColor;
  }

  static create(props: AffiliateSubProviderProps): AffiliateSubProvider {
    return new AffiliateSubProvider(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.providerColor
    );
  }

  static reconstitute(props: AffiliateSubProviderProps): AffiliateSubProvider {
    return new AffiliateSubProvider(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.providerColor
    );
  }
}

import type { AffiliateType } from '../types/enums';
import type { AffiliateId, Name, Provider, TargetUrl } from '../value-objects';

/**
 * Core props shared by all affiliate types
 */
export interface CoreProps {
  id: AffiliateId;
  name: Name;
  targetUrl: TargetUrl;
  provider: Provider;
}

/**
 * AffiliateCore Abstract Base Class
 *
 * Provides common properties and behavior for all affiliate entity types.
 * Each concrete affiliate type extends this class.
 */
export abstract class AffiliateCore {
  protected constructor(
    protected readonly _id: AffiliateId,
    protected readonly _name: Name,
    protected readonly _targetUrl: TargetUrl,
    protected readonly _provider: Provider
  ) {}

  get id(): AffiliateId {
    return this._id;
  }

  get name(): Name {
    return this._name;
  }

  get targetUrl(): TargetUrl {
    return this._targetUrl;
  }

  get provider(): Provider {
    return this._provider;
  }

  abstract get type(): AffiliateType;

  equals(other: AffiliateCore): boolean {
    return this.id.equals(other.id);
  }
}

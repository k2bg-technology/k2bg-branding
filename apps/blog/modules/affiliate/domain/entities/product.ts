import { AffiliateType } from '../types/enums';
import type {
  AffiliateId,
  ImageHeight,
  ImageProvider,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  ProviderColor,
  SubProviderIds,
  TargetUrl,
} from '../value-objects';

import { AffiliateCore, type CoreProps } from './core';

/**
 * Props for creating an AffiliateProduct entity
 */
export interface AffiliateProductProps extends CoreProps {
  providerColor: ProviderColor;
  subProviderIds: SubProviderIds;
  imageProvider: ImageProvider;
  imageSourceUrl: ImageSourceUrl;
  imageWidth: ImageWidth;
  imageHeight: ImageHeight;
}

/**
 * AffiliateProduct Entity
 *
 * Represents a product promotion with image and multiple provider links.
 * The most feature-rich affiliate type with support for sub-providers.
 */
export class AffiliateProduct extends AffiliateCore {
  private constructor(
    _id: AffiliateId,
    _name: Name,
    _targetUrl: TargetUrl,
    _provider: Provider,
    private readonly _providerColor: ProviderColor,
    private readonly _subProviderIds: SubProviderIds,
    private readonly _imageProvider: ImageProvider,
    private readonly _imageSourceUrl: ImageSourceUrl,
    private readonly _imageWidth: ImageWidth,
    private readonly _imageHeight: ImageHeight
  ) {
    super(_id, _name, _targetUrl, _provider);
  }

  get type(): AffiliateType {
    return AffiliateType.PRODUCT;
  }

  get providerColor(): ProviderColor {
    return this._providerColor;
  }

  get subProviderIds(): SubProviderIds {
    return this._subProviderIds;
  }

  get imageProvider(): ImageProvider {
    return this._imageProvider;
  }

  get imageSourceUrl(): ImageSourceUrl {
    return this._imageSourceUrl;
  }

  get imageWidth(): ImageWidth {
    return this._imageWidth;
  }

  get imageHeight(): ImageHeight {
    return this._imageHeight;
  }

  hasSubProviders(): boolean {
    return !this._subProviderIds.isEmpty();
  }

  static create(props: AffiliateProductProps): AffiliateProduct {
    return new AffiliateProduct(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.providerColor,
      props.subProviderIds,
      props.imageProvider,
      props.imageSourceUrl,
      props.imageWidth,
      props.imageHeight
    );
  }

  static reconstitute(props: AffiliateProductProps): AffiliateProduct {
    return new AffiliateProduct(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.providerColor,
      props.subProviderIds,
      props.imageProvider,
      props.imageSourceUrl,
      props.imageWidth,
      props.imageHeight
    );
  }
}

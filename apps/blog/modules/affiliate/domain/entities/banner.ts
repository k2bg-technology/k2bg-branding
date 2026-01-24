import { AffiliateType } from '../types/enums';
import type {
  AffiliateId,
  ImageHeight,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  TargetUrl,
} from '../value-objects';

import { AffiliateCore, type CoreProps } from './core';

/**
 * Props for creating an AffiliateBanner entity
 */
export interface AffiliateBannerProps extends CoreProps {
  imageSourceUrl: ImageSourceUrl;
  imageWidth: ImageWidth;
  imageHeight: ImageHeight;
}

/**
 * AffiliateBanner Entity
 *
 * Represents an image-based advertisement with a clickable banner.
 * Contains image properties in addition to core affiliate properties.
 */
export class AffiliateBanner extends AffiliateCore {
  private constructor(
    _id: AffiliateId,
    _name: Name,
    _targetUrl: TargetUrl,
    _provider: Provider,
    private readonly _imageSourceUrl: ImageSourceUrl,
    private readonly _imageWidth: ImageWidth,
    private readonly _imageHeight: ImageHeight
  ) {
    super(_id, _name, _targetUrl, _provider);
  }

  get type(): AffiliateType {
    return AffiliateType.BANNER;
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

  static create(props: AffiliateBannerProps): AffiliateBanner {
    return new AffiliateBanner(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.imageSourceUrl,
      props.imageWidth,
      props.imageHeight
    );
  }

  static reconstitute(props: AffiliateBannerProps): AffiliateBanner {
    return new AffiliateBanner(
      props.id,
      props.name,
      props.targetUrl,
      props.provider,
      props.imageSourceUrl,
      props.imageWidth,
      props.imageHeight
    );
  }
}

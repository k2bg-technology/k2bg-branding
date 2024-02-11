export interface AffiliateCore {
  name: string;
  type: string;
  linkText: string;
  linkUrl: string;
  provider: string;
}

export interface AffiliateText extends AffiliateCore {}

export interface AffiliateBanner extends AffiliateCore {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface AffiliateProduction extends AffiliateCore {
  subProviders: string[];
  imageProvider: string;
  imageFile: string;
  imageWidth: number;
  imageHeight: number;
}

export interface AffiliateData {
  getTitle: (propertyName: string) => string | undefined;
  getRichText: (propertyName: string) => string | undefined;
  getNumber: (propertyName: string) => number | undefined;
  getSelect: (propertyName: string) => string | undefined;
  getUrl: (propertyName: string) => string | undefined;
  getRelations: (propertyName: string) => string[];
  getFiles: (propertyName: string) => string[] | undefined;
}

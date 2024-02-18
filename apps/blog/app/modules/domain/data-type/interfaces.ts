export const DATA_TYPE_NAMES = [
  'page',
  'article',
  'affiliateProduct',
  'affiliateBanner',
  'affiliateText',
  'mediaImage',
  'mediaVideo',
  'mediaAudio',
] as const;

export type DATA_TYPE_NAMES = (typeof DATA_TYPE_NAMES)[number];

export interface DataTypeCore {
  name?: DATA_TYPE_NAMES;
}

export interface DataType {
  getDataType(): string | undefined;
}

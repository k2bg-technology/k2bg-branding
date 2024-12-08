export const DATA_TYPE_NAMES = [
  'PAGE',
  'ARTICLE',
  'AFFILIATE_PRODUCT',
  'AFFILIATE_BANNER',
  'AFFILIATE_TEXT',
  'MEDIA_IMAGE',
  'MEDIA_VIDEO',
  'MEDIA_AUDIO',
] as const;

export type DATA_TYPE_NAMES = (typeof DATA_TYPE_NAMES)[number];

export interface DataTypeCore {
  name?: DATA_TYPE_NAMES;
}

export interface DataType {
  getDataType(): string | undefined;
}

export const AffiliateType = {
  BANNER: 'BANNER',
  PRODUCT: 'PRODUCT',
  TEXT: 'TEXT',
  SUB_PROVIDER: 'SUB_PROVIDER',
} as const;

export type AffiliateType = (typeof AffiliateType)[keyof typeof AffiliateType];

/**
 * Affiliate Domain Enums
 *
 * Defines enumeration types for the Affiliate domain.
 */

// =============================================================================
// AffiliateType
// =============================================================================

export const AffiliateType = {
  BANNER: 'BANNER',
  PRODUCT: 'PRODUCT',
  TEXT: 'TEXT',
  SUB_PROVIDER: 'SUB_PROVIDER',
} as const;

export type AffiliateType = (typeof AffiliateType)[keyof typeof AffiliateType];

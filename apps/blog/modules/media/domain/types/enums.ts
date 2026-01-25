/**
 * Media Domain Enums
 *
 * Defines enumeration types for the Media domain.
 */

// =============================================================================
// MediaType
// =============================================================================

export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

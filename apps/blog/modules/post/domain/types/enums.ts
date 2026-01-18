/**
 * Post Domain Enums
 *
 * Defines enumeration types for the Post domain.
 */

// =============================================================================
// PostType
// =============================================================================

export const PostType = {
  ARTICLE: 'ARTICLE',
  PAGE: 'PAGE',
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];

// =============================================================================
// PostStatus
// =============================================================================

export const PostStatus = {
  IDEA: 'IDEA',
  DRAFT: 'DRAFT',
  PREVIEW: 'PREVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

// =============================================================================
// Category
// =============================================================================

export const Category = {
  ENGINEERING: 'ENGINEERING',
  DESIGN: 'DESIGN',
  DATA_SCIENCE: 'DATA_SCIENCE',
  LIFE_STYLE: 'LIFE_STYLE',
  OTHER: 'OTHER',
} as const;

export type Category = (typeof Category)[keyof typeof Category];

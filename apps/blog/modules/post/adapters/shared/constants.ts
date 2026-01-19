/**
 * Default values used across adapters when source data is missing.
 */
export const DEFAULT_VALUES = {
  /** Placeholder image URL for posts without images */
  PLACEHOLDER_IMAGE_URL: 'https://placeholder.com/image.jpg',
  /** Anonymous author UUID for posts without assigned authors */
  ANONYMOUS_AUTHOR_UUID: '00000000-0000-4000-a000-000000000000',
} as const;

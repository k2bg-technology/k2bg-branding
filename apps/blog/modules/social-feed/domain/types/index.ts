/**
 * Media type enumeration for social posts
 * Represents the type of media content in a social post
 */
export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  CAROUSEL_ALBUM: 'CAROUSEL_ALBUM',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

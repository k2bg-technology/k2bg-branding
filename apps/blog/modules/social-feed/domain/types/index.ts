export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  CAROUSEL_ALBUM: 'CAROUSEL_ALBUM',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const DEFAULT_VALUES = {
  PLACEHOLDER_IMAGE_URL: 'https://placeholder.com/media.jpg',
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  DEFAULT_EXTENSION: 'jpg',
} as const;

export const NOTION_PROPERTY_NAMES = {
  NAME: 'name',
  TYPE: 'type',
  SOURCE_FILE: 'sourceFile',
  SOURCE_URL: 'sourceUrl',
  TARGET_URL: 'targetUrl',
  WIDTH: 'width',
  HEIGHT: 'height',
  EXTENSION: 'extension',
} as const;

export const NOTION_MEDIA_TYPES = {
  IMAGE: 'MEDIA_IMAGE',
  VIDEO: 'MEDIA_VIDEO',
} as const;

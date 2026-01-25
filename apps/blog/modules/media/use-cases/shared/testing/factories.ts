import {
  Extension,
  Height,
  type ImageSource,
  Media,
  MediaId,
  MediaName,
  type MediaProps,
  MediaType,
  SourceFile,
  SourceUrl,
  TargetUrl,
  Width,
} from '../../../domain';

let counter = 0;

/**
 * Resets the counter for test isolation
 */
export const resetFactoryCounter = (): void => {
  counter = 0;
};

/**
 * Creates a test ImageSource with optional overrides
 */
export const createImageSource = (
  overrides: Partial<{
    id: MediaId;
    url: SourceUrl;
  }> = {}
): ImageSource => {
  counter++;
  return {
    id:
      overrides.id ??
      MediaId.reconstitute(
        `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
      ),
    url:
      overrides.url ??
      SourceUrl.reconstitute(`https://example.com/images/media-${counter}.jpg`),
  };
};

/**
 * Creates multiple test ImageSources
 */
export const createImageSources = (count: number): ImageSource[] =>
  Array.from({ length: count }, () => createImageSource());

/**
 * Creates valid MediaProps for testing
 */
export const createMediaProps = (
  overrides: Partial<MediaProps> = {}
): MediaProps => {
  counter++;
  return {
    id: MediaId.reconstitute(
      `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
    ),
    name: MediaName.reconstitute(`Test Media ${counter}`),
    type: MediaType.IMAGE,
    sourceFile: null,
    sourceUrl: SourceUrl.reconstitute(
      `https://example.com/images/media-${counter}.jpg`
    ),
    targetUrl: TargetUrl.reconstitute(`https://example.com/link/${counter}`),
    width: Width.reconstitute(800),
    height: Height.reconstitute(600),
    extension: Extension.reconstitute('jpg'),
    ...overrides,
  };
};

/**
 * Creates a Media entity for testing (with sourceUrl)
 */
export const createMedia = (overrides: Partial<MediaProps> = {}): Media => {
  return Media.reconstitute(createMediaProps(overrides));
};

/**
 * Creates a Media entity with sourceFile for testing
 */
export const createMediaWithFile = (
  overrides: Partial<MediaProps> = {}
): Media => {
  counter++;
  return Media.reconstitute({
    id: MediaId.reconstitute(
      `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
    ),
    name: MediaName.reconstitute(`Test Media ${counter}`),
    type: MediaType.IMAGE,
    sourceFile: SourceFile.reconstitute(`/uploads/media-${counter}.jpg`),
    sourceUrl: null,
    targetUrl: null,
    width: Width.reconstitute(800),
    height: Height.reconstitute(600),
    extension: Extension.reconstitute('jpg'),
    ...overrides,
  });
};

/**
 * Creates multiple Media entities for testing
 */
export const createMediaList = (
  count: number,
  overrides: Partial<MediaProps> = {}
): Media[] => Array.from({ length: count }, () => createMedia(overrides));

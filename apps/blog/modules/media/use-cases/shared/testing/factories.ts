import {
  Extension,
  Height,
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

export const resetFactoryCounter = (): void => {
  counter = 0;
};

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

export const createMedia = (overrides: Partial<MediaProps> = {}): Media => {
  return Media.reconstitute(createMediaProps(overrides));
};

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

export const createMediaList = (
  count: number,
  overrides: Partial<MediaProps> = {}
): Media[] => Array.from({ length: count }, () => createMedia(overrides));

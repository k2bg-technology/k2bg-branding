import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import {
  getAllFileUrls,
  getNumber,
  getRichText,
  getSelect,
  getTitle,
  getUrl,
  type NotionProperties,
} from '../../../../../../infrastructure/notion';
import {
  Extension,
  Height,
  type ImageSource,
  Media,
  MediaId,
  MediaName,
  MediaType,
  SourceFile,
  SourceUrl,
  TargetUrl,
  Width,
} from '../../../../domain';
import { MappingError, NOTION_MEDIA_TYPES } from '../../../shared';

/**
 * Extracts source with file priority over URL (business rule).
 * Returns both sourceFile and sourceUrl separately for domain entity.
 */
function extractSources(props: NotionProperties): {
  sourceFile: SourceFile | null;
  sourceUrl: SourceUrl | null;
} {
  const fileUrl = getAllFileUrls(props, 'sourceFile')?.[0];
  const urlValue = getUrl(props, 'sourceUrl');

  return {
    sourceFile: fileUrl ? SourceFile.reconstitute(fileUrl) : null,
    sourceUrl: urlValue ? SourceUrl.reconstitute(urlValue) : null,
  };
}

/**
 * Determines the MediaType from Notion select property.
 */
export function determineMediaType(page: PageObjectResponse): MediaType | null {
  const typeString = getSelect(page.properties, 'type');

  switch (typeString?.toUpperCase()) {
    case NOTION_MEDIA_TYPES.IMAGE:
      return MediaType.IMAGE;
    case NOTION_MEDIA_TYPES.VIDEO:
      return MediaType.VIDEO;
    default:
      return null;
  }
}

/**
 * Maps a Notion page to a Media domain entity.
 */
export function notionPageToMedia(page: PageObjectResponse): Media {
  const mediaType = determineMediaType(page);
  if (!mediaType) {
    throw new MappingError(`Unknown media type for page: ${page.id}`);
  }

  const props = page.properties;
  const { sourceFile, sourceUrl } = extractSources(props);

  if (!sourceFile && !sourceUrl) {
    throw new MappingError(
      `Media must have either sourceFile or sourceUrl: ${page.id}`
    );
  }

  const widthValue = getNumber(props, 'width');
  const heightValue = getNumber(props, 'height');
  const extensionValue = getRichText(props, 'extension');
  const targetUrlValue = getUrl(props, 'targetUrl');

  return Media.reconstitute({
    id: MediaId.reconstitute(page.id),
    name: MediaName.reconstitute(getTitle(props, 'name') ?? 'Untitled'),
    type: mediaType,
    sourceFile,
    sourceUrl,
    targetUrl: targetUrlValue ? TargetUrl.reconstitute(targetUrlValue) : null,
    width: widthValue !== null ? Width.reconstitute(widthValue) : null,
    height: heightValue !== null ? Height.reconstitute(heightValue) : null,
    extension: extensionValue ? Extension.reconstitute(extensionValue) : null,
  });
}

/**
 * Maps a Notion page to an ImageSource for batch processing.
 * Returns null for VIDEO types or when no source exists.
 * Business rule: file takes priority over URL.
 */
export function notionPageToImageSource(
  page: PageObjectResponse
): ImageSource | null {
  const mediaType = determineMediaType(page);

  if (mediaType !== MediaType.IMAGE) {
    return null;
  }

  const { sourceFile, sourceUrl } = extractSources(page.properties);

  // Business rule: file takes priority over URL
  const effectiveUrl = sourceFile?.getValue() ?? sourceUrl?.getValue();
  if (!effectiveUrl) {
    return null;
  }

  return {
    id: MediaId.reconstitute(page.id),
    url: SourceUrl.reconstitute(effectiveUrl),
  };
}

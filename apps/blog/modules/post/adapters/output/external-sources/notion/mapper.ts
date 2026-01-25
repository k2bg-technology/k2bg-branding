import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { format } from 'date-fns';

import {
  getDate,
  getFirstFileUrl,
  getMultiSelect,
  getPerson,
  getRichText,
  getSelect,
  getStatus,
  getTitle,
} from '../../../../../../infrastructure/notion';
import {
  AuthorId,
  Category,
  Content,
  EmbedType,
  Excerpt,
  ImageUrl,
  Post,
  PostId,
  type PostProps,
  PostStatus,
  PostType,
  ReleaseDate,
  RevisionDate,
  Slug,
  Tags,
  Title,
} from '../../../../domain';
import type { ImageSourceRecord } from '../../../../use-cases';
import { DEFAULT_VALUES, MappingError } from '../../../shared';

/**
 * Maps a Notion Page Response to a Domain Post entity.
 *
 * @throws MappingError if the mapping fails due to invalid data
 */
export function notionPageToPost(
  page: PageObjectResponse,
  content: string
): Post {
  try {
    const now = new Date();
    const props = page.properties;

    const title = getTitle(props, 'content');
    const type = getSelect(props, 'type') ?? 'ARTICLE';
    const excerpt = getRichText(props, 'excerpt');
    const imageUrl = getFirstFileUrl(props, 'imageUrl') ?? '';
    const slugText = getRichText(props, 'slug');
    const slug = slugText || toKebabCase(page.id);
    const status = getStatus(props, 'status') ?? 'DRAFT';
    const category = getSelect(props, 'category') ?? 'OTHER';
    const releaseDate =
      getDate(props, 'releaseDate') ?? format(now, 'yyyy-MM-dd');
    const revisionDate =
      getDate(props, 'revisionDate') ?? format(now, 'yyyy-MM-dd');
    const author = getPerson(props, 'author');
    const tags = getMultiSelect(props, 'tags');

    const postProps: PostProps = {
      id: PostId.create(page.id),
      title: Title.create(title || 'Untitled'),
      content: Content.create(content || ' '),
      type: mapPostType(type),
      excerpt: excerpt ? Excerpt.create(excerpt) : Excerpt.empty(),
      imageUrl: ImageUrl.create(
        imageUrl || DEFAULT_VALUES.PLACEHOLDER_IMAGE_URL
      ),
      slug: Slug.create(slug),
      status: mapPostStatus(status),
      category: mapCategory(category),
      tags: tags.length > 0 ? Tags.create(tags) : Tags.empty(),
      authorId: AuthorId.create(
        author?.id ?? DEFAULT_VALUES.ANONYMOUS_AUTHOR_UUID
      ),
      releaseDate: ReleaseDate.create(releaseDate),
      revisionDate: RevisionDate.create(revisionDate),
      createdAt: new Date(page.created_time),
      updatedAt: new Date(page.last_edited_time),
      deletedAt: null,
    };

    return Post.reconstitute(postProps);
  } catch (error) {
    throw new MappingError(
      `Failed to map Notion Page to Domain Post: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

/**
 * Maps a Notion Page Response to an ImageSourceRecord.
 * Returns null if the page has no image URL.
 */
export function notionPageToImageSource(
  page: PageObjectResponse
): ImageSourceRecord | null {
  const imageUrl = getFirstFileUrl(page.properties, 'imageUrl');
  if (!imageUrl) {
    return null;
  }
  return {
    id: page.id,
    url: imageUrl,
  };
}

/**
 * Extracts embed type from a Notion Page Response.
 * Returns the type string (e.g., 'MEDIA_IMAGE', 'AFFILIATE_TEXT') or null.
 */
export function getEmbedTypeFromPage(page: PageObjectResponse): string | null {
  return getSelect(page.properties, 'type');
}

/**
 * Maps a type string to an EmbedType enum value.
 * Returns null if the type is unknown.
 */
export function mapEmbedType(type: string): EmbedType | null {
  const normalizedType = type.toUpperCase();

  switch (normalizedType) {
    case 'AFFILIATE_PRODUCT':
      return EmbedType.AFFILIATE_PRODUCT;
    case 'AFFILIATE_BANNER':
      return EmbedType.AFFILIATE_BANNER;
    case 'AFFILIATE_TEXT':
      return EmbedType.AFFILIATE_TEXT;
    case 'MEDIA_IMAGE':
      return EmbedType.MEDIA_IMAGE;
    case 'MEDIA_VIDEO':
      return EmbedType.MEDIA_VIDEO;
    case 'MEDIA_AUDIO':
      return EmbedType.MEDIA_AUDIO;
    default:
      return null;
  }
}

// =============================================================================
// Enum Mapping Helpers
// =============================================================================

function mapPostType(type: string): PostType {
  switch (type.toUpperCase()) {
    case 'ARTICLE':
      return PostType.ARTICLE;
    case 'PAGE':
      return PostType.PAGE;
    default:
      return PostType.ARTICLE;
  }
}

function mapPostStatus(status: string): PostStatus {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalizedStatus) {
    case 'IDEA':
      return PostStatus.IDEA;
    case 'DRAFT':
      return PostStatus.DRAFT;
    case 'PREVIEW':
      return PostStatus.PREVIEW;
    case 'PUBLISHED':
      return PostStatus.PUBLISHED;
    case 'ARCHIVED':
      return PostStatus.ARCHIVED;
    default:
      return PostStatus.DRAFT;
  }
}

function mapCategory(category: string): Category {
  const normalizedCategory = category.toUpperCase().replace(/\s+/g, '_');
  switch (normalizedCategory) {
    case 'ENGINEERING':
      return Category.ENGINEERING;
    case 'DESIGN':
      return Category.DESIGN;
    case 'DATA_SCIENCE':
      return Category.DATA_SCIENCE;
    case 'LIFE_STYLE':
      return Category.LIFE_STYLE;
    case 'OTHER':
      return Category.OTHER;
    default:
      return Category.OTHER;
  }
}

/**
 * Converts a UUID or string to kebab-case slug format.
 * Removes non-alphanumeric characters except hyphens and converts to lowercase.
 */
function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

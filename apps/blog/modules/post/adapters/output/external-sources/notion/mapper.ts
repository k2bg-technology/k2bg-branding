import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { format } from 'date-fns';
import {
  AuthorId,
  Category,
  Content,
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
import { MappingError } from '../../../shared';

type NotionProperties = PageObjectResponse['properties'];

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
    const imageUrl = getFiles(props, 'imageUrl') ?? '';
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
        imageUrl || 'https://placeholder.com/image.jpg'
      ),
      slug: Slug.create(slug),
      status: mapPostStatus(status),
      category: mapCategory(category),
      tags: tags.length > 0 ? Tags.create(tags) : Tags.empty(),
      authorId: AuthorId.create(
        author?.id ?? '00000000-0000-4000-a000-000000000000'
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
  const imageUrl = getFiles(page.properties, 'imageUrl');
  if (!imageUrl) {
    return null;
  }
  return {
    id: page.id,
    url: imageUrl,
  };
}

// =============================================================================
// Property Extraction Helpers
// =============================================================================

function getTitle(props: NotionProperties, propName: string): string {
  const prop = props[propName];
  if (prop?.type === 'title') {
    return prop.title.map((t) => t.plain_text).join('');
  }
  return '';
}

function getRichText(props: NotionProperties, propName: string): string | null {
  const prop = props[propName];
  if (prop?.type === 'rich_text') {
    const text = prop.rich_text.map((t) => t.plain_text).join('');
    return text || null;
  }
  return null;
}

function getSelect(props: NotionProperties, propName: string): string | null {
  const prop = props[propName];
  if (prop?.type === 'select') {
    return prop.select?.name ?? null;
  }
  return null;
}

function getStatus(props: NotionProperties, propName: string): string | null {
  const prop = props[propName];
  if (prop?.type === 'status') {
    return prop.status?.name ?? null;
  }
  return null;
}

function getDate(props: NotionProperties, propName: string): string | null {
  const prop = props[propName];
  if (prop?.type === 'date' && prop.date?.start) {
    return format(new Date(prop.date.start), 'yyyy-MM-dd');
  }
  return null;
}

function getFiles(props: NotionProperties, propName: string): string | null {
  const prop = props[propName];
  if (prop?.type === 'files' && prop.files.length > 0) {
    const file = prop.files[0];
    if (file.type === 'file') {
      return file.file.url;
    }
    if (file.type === 'external') {
      return file.external.url;
    }
  }
  return null;
}

function getPerson(
  props: NotionProperties,
  propName: string
): { id: string; name?: string; avatarUrl?: string } | null {
  const prop = props[propName];
  if (prop?.type === 'people' && prop.people.length > 0) {
    const person = prop.people[0];
    // Check if person has full user data (UserObjectResponse) or partial (PartialUserObjectResponse)
    const hasFullData = 'name' in person;
    return {
      id: person.id,
      name: hasFullData
        ? ((person as { name: string | null }).name ?? undefined)
        : undefined,
      avatarUrl: hasFullData
        ? ((person as { avatar_url: string | null }).avatar_url ?? undefined)
        : undefined,
    };
  }
  return null;
}

function getMultiSelect(props: NotionProperties, propName: string): string[] {
  const prop = props[propName];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((item) => item.name);
  }
  return [];
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

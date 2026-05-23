import type {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
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
import { MappingError } from '../../../shared';

type PostRow = typeof posts.$inferSelect;
type AuthorRow = typeof authors.$inferSelect;
export type PostRowWithAuthor = PostRow & { author: AuthorRow };

export function toDomain(row: PostRowWithAuthor): Post {
  try {
    const props: PostProps = {
      id: PostId.create(row.uuid),
      title: Title.create(row.title),
      content: Content.create(row.content),
      type: mapPostType(row.type),
      excerpt: row.excerpt ? Excerpt.create(row.excerpt) : Excerpt.empty(),
      imageUrl: ImageUrl.create(row.imageUrl),
      slug: Slug.create(row.slug),
      status: mapPostStatus(row.status),
      category: mapCategory(row.category),
      tags: Tags.create(row.tags ?? []),
      authorId: AuthorId.create(row.authorId),
      releaseDate: ReleaseDate.create(row.releaseDate),
      revisionDate: RevisionDate.create(row.revisionDate),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: null,
    };

    return Post.reconstitute(props);
  } catch (error) {
    throw new MappingError(
      `Failed to map Drizzle Post to Domain: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

export function toPersistence(post: Post): typeof posts.$inferInsert {
  return {
    uuid: post.id.getValue(),
    title: post.title.getValue(),
    content: post.content.getValue(),
    type: post.type,
    excerpt: post.excerpt.getValue() ?? '',
    imageUrl: post.imageUrl.getValue(),
    slug: post.slug.getValue(),
    status: post.status,
    category: post.category,
    tags: [...post.tags.getValues()],
    releaseDate: post.releaseDate.toISOString(),
    revisionDate: post.revisionDate.toISOString(),
    authorId: post.authorId.getValue(),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function mapPostType(value: string): PostType {
  switch (value) {
    case 'ARTICLE':
      return PostType.ARTICLE;
    case 'PAGE':
      return PostType.PAGE;
    default:
      return PostType.ARTICLE;
  }
}

function mapPostStatus(value: string): PostStatus {
  switch (value) {
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

function mapCategory(value: string): Category {
  switch (value) {
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

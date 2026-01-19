import type {
  Author as PrismaAuthor,
  Category as PrismaCategory,
  Post as PrismaPost,
  Status as PrismaStatus,
  Type as PrismaType,
} from '@prisma/client';
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

type PrismaPostWithAuthor = PrismaPost & { author: PrismaAuthor };

/**
 * Maps a Prisma Post record to a Domain Post entity.
 *
 * @throws MappingError if the mapping fails due to invalid data
 */
export function toDomain(prismaPost: PrismaPostWithAuthor): Post {
  try {
    const props: PostProps = {
      id: PostId.create(prismaPost.uuid),
      title: Title.create(prismaPost.title),
      content: Content.create(prismaPost.content),
      type: mapPostType(prismaPost.type),
      excerpt: prismaPost.excerpt
        ? Excerpt.create(prismaPost.excerpt)
        : Excerpt.empty(),
      imageUrl: ImageUrl.create(prismaPost.imageUrl),
      slug: Slug.create(prismaPost.slug),
      status: mapPostStatus(prismaPost.status),
      category: mapCategory(prismaPost.category),
      tags: Tags.create(prismaPost.tags),
      authorId: AuthorId.create(prismaPost.authorId),
      releaseDate: ReleaseDate.create(prismaPost.releaseDate),
      revisionDate: RevisionDate.create(prismaPost.revisionDate),
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
      deletedAt: null,
    };

    return Post.reconstitute(props);
  } catch (error) {
    throw new MappingError(
      `Failed to map Prisma Post to Domain: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

/**
 * Maps a Domain Post entity to Prisma persistence data.
 */
export function toPersistence(post: Post): {
  uuid: string;
  title: string;
  content: string;
  type: PrismaType;
  excerpt: string;
  imageUrl: string;
  slug: string;
  status: PrismaStatus;
  category: PrismaCategory;
  tags: string[];
  releaseDate: string;
  revisionDate: string;
  authorId: string;
} {
  return {
    uuid: post.id.getValue(),
    title: post.title.getValue(),
    content: post.content.getValue(),
    type: post.type as PrismaType,
    excerpt: post.excerpt.getValue() ?? '',
    imageUrl: post.imageUrl.getValue(),
    slug: post.slug.getValue(),
    status: post.status as PrismaStatus,
    category: post.category as PrismaCategory,
    tags: [...post.tags.getValues()],
    releaseDate: post.releaseDate.toISOString(),
    revisionDate: post.revisionDate.toISOString(),
    authorId: post.authorId.getValue(),
  };
}

function mapPostType(type: string): PostType {
  switch (type) {
    case 'ARTICLE':
      return PostType.ARTICLE;
    case 'PAGE':
      return PostType.PAGE;
    default:
      return PostType.ARTICLE;
  }
}

function mapPostStatus(status: string): PostStatus {
  switch (status) {
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
  switch (category) {
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

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
} from '../../../domain';
import type {
  AuthorOutput,
  PaginatedResult,
  PostOutput,
  SlugOutput,
} from '../types';

/**
 * Creates valid PostProps for testing
 */
export function createPostProps(overrides: Partial<PostProps> = {}): PostProps {
  return {
    id: PostId.create('550e8400-e29b-41d4-a716-446655440000'),
    title: Title.create('Test Post Title'),
    content: Content.create('This is the test post content.'),
    type: PostType.ARTICLE,
    excerpt: Excerpt.create('Test excerpt'),
    imageUrl: ImageUrl.create('https://example.com/image.jpg'),
    slug: Slug.create('test-post'),
    status: PostStatus.PUBLISHED,
    category: Category.ENGINEERING,
    tags: Tags.create(['typescript', 'testing']),
    authorId: AuthorId.create('660e8400-e29b-41d4-a716-446655440000'),
    releaseDate: ReleaseDate.create('2024-01-15'),
    revisionDate: RevisionDate.create('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Creates a Post entity for testing
 */
export function createPost(overrides: Partial<PostProps> = {}): Post {
  return Post.reconstitute(createPostProps(overrides));
}

/**
 * Creates a PostOutput DTO for testing
 */
export function createPostOutput(
  overrides: Partial<PostOutput> = {}
): PostOutput {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Post Title',
    content: 'This is the test post content.',
    type: PostType.ARTICLE,
    excerpt: 'Test excerpt',
    imageUrl: 'https://example.com/image.jpg',
    slug: 'test-post',
    status: PostStatus.PUBLISHED,
    category: Category.ENGINEERING,
    tags: ['typescript', 'testing'],
    authorId: '660e8400-e29b-41d4-a716-446655440000',
    author: {
      id: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Test Author',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    releaseDate: '2024-01-15',
    revisionDate: '2024-01-15',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Creates a SlugOutput for testing
 */
export function createSlugOutput(
  overrides: Partial<SlugOutput> = {}
): SlugOutput {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    slug: 'test-post',
    ...overrides,
  };
}

/**
 * Creates a PaginatedResult for testing
 */
export function createPaginatedResult<T>(
  items: T[],
  overrides: Partial<Omit<PaginatedResult<T>, 'items'>> = {}
): PaginatedResult<T> {
  const totalCount = overrides.totalCount ?? items.length;
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = overrides.currentPage ?? 1;

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    ...overrides,
  };
}

/**
 * Creates multiple posts for testing
 */
export function createPosts(
  count: number,
  overrides: Partial<PostProps> = {}
): Post[] {
  return Array.from({ length: count }, (_, index) => {
    const id = PostId.create(`550e8400-e29b-41d4-a716-44665544000${index}`);
    const slug = Slug.create(`test-post-${index}`);
    return createPost({ ...overrides, id, slug });
  });
}

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

/**
 * Creates a PostWithAuthor for testing
 */
export function createPostWithAuthor(
  overrides: Partial<PostProps> = {},
  author: AuthorOutput | null = null
): PostWithAuthor {
  return {
    post: createPost(overrides),
    author,
  };
}

/**
 * Creates multiple PostWithAuthor objects for testing
 */
export function createPostsWithAuthor(
  count: number,
  overrides: Partial<PostProps> = {},
  author: AuthorOutput | null = null
): PostWithAuthor[] {
  return Array.from({ length: count }, (_, index) => {
    const id = PostId.create(`550e8400-e29b-41d4-a716-44665544000${index}`);
    const slug = Slug.create(`test-post-${index}`);
    return {
      post: createPost({ ...overrides, id, slug }),
      author,
    };
  });
}

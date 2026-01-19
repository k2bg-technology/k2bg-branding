import type {
  Author as PrismaAuthor,
  Post as PrismaPost,
} from '@prisma/client';

/**
 * Creates a mock Prisma Post record for testing.
 */
export function createPrismaPost(
  overrides: Partial<PrismaPost> = {}
): PrismaPost {
  return {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Post Title',
    content: 'This is the test post content.',
    type: 'ARTICLE',
    excerpt: 'Test excerpt',
    imageUrl: 'https://example.com/image.jpg',
    slug: 'test-post',
    status: 'PUBLISHED',
    category: 'ENGINEERING',
    tags: ['typescript', 'testing'],
    releaseDate: '2024-01-15',
    revisionDate: '2024-01-15',
    authorId: '660e8400-e29b-41d4-a716-446655440000',
    createdAt: new Date('2024-01-15T00:00:00.000Z'),
    updatedAt: new Date('2024-01-15T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Creates a mock Prisma Author record for testing.
 */
export function createAuthorRecord(
  overrides: Partial<PrismaAuthor> = {}
): PrismaAuthor {
  return {
    id: 1,
    uuid: '660e8400-e29b-41d4-a716-446655440000',
    name: 'Test Author',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-15T00:00:00.000Z'),
    updatedAt: new Date('2024-01-15T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Creates a mock Prisma Post with Author relation for testing.
 */
export function createPrismaPostWithAuthor(
  postOverrides: Partial<PrismaPost> = {},
  authorOverrides: Partial<PrismaAuthor> = {}
): PrismaPost & { author: PrismaAuthor } {
  const author = createAuthorRecord(authorOverrides);
  return {
    ...createPrismaPost({
      ...postOverrides,
      authorId: postOverrides.authorId ?? author.uuid,
    }),
    author,
  };
}

/**
 * Creates multiple Prisma Posts with Author for testing.
 */
export function createPrismaPostsWithAuthor(
  count: number,
  overrides: Partial<PrismaPost> = {}
): Array<PrismaPost & { author: PrismaAuthor }> {
  return Array.from({ length: count }, (_, index) =>
    createPrismaPostWithAuthor({
      id: index + 1,
      uuid: `550e8400-e29b-41d4-a716-44665544000${index}`,
      slug: `test-post-${index}`,
      ...overrides,
    })
  );
}

/**
 * Creates a mock Notion Page Response for testing.
 */
export function createNotionPageResponse(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    object: 'page',
    created_time: '2024-01-15T00:00:00.000Z',
    last_edited_time: '2024-01-15T00:00:00.000Z',
    properties: {
      content: {
        type: 'title',
        title: [{ plain_text: 'Test Post Title' }],
      },
      type: {
        type: 'select',
        select: { name: 'ARTICLE' },
      },
      status: {
        type: 'status',
        status: { name: 'PUBLISHED' },
      },
      category: {
        type: 'select',
        select: { name: 'ENGINEERING' },
      },
      excerpt: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'Test excerpt' }],
      },
      slug: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'test-post' }],
      },
      imageUrl: {
        type: 'files',
        files: [
          {
            type: 'external',
            external: { url: 'https://example.com/image.jpg' },
          },
        ],
      },
      releaseDate: {
        type: 'date',
        date: { start: '2024-01-15' },
      },
      revisionDate: {
        type: 'date',
        date: { start: '2024-01-15' },
      },
      author: {
        type: 'people',
        people: [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            name: 'Test Author',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        ],
      },
      tags: {
        type: 'multi_select',
        multi_select: [{ name: 'typescript' }, { name: 'testing' }],
      },
    },
    ...overrides,
  };
}

/**
 * Creates multiple Notion Page Responses for testing.
 */
export function createNotionPageResponses(
  count: number,
  overrides: Record<string, unknown> = {}
): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, index) =>
    createNotionPageResponse({
      id: `550e8400-e29b-41d4-a716-44665544000${index}`,
      properties: {
        ...(createNotionPageResponse().properties as Record<string, unknown>),
        slug: {
          type: 'rich_text',
          rich_text: [{ plain_text: `test-post-${index}` }],
        },
      },
      ...overrides,
    })
  );
}

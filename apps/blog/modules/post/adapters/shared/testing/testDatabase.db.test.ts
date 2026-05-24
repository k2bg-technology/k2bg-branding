import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { authors, posts } from '../../../../../infrastructure/drizzle/schema';
import { getTestDb, truncateAllTables } from './testDatabase';

describe('testDatabase', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('applies the Drizzle baseline migration to the Testcontainers Postgres', async () => {
    const db = getTestDb();
    const authorUuid = '660e8400-e29b-41d4-a716-446655440000';
    const postUuid = '550e8400-e29b-41d4-a716-446655440000';
    const now = new Date('2024-01-15T00:00:00.000Z');

    await db.insert(authors).values({
      uuid: authorUuid,
      name: 'Test Author',
      avatarUrl: null,
      updatedAt: now,
    });
    await db.insert(posts).values({
      uuid: postUuid,
      title: 'Smoke Test Post',
      content: 'content',
      type: 'ARTICLE',
      excerpt: '',
      imageUrl: 'https://example.com/image.jpg',
      slug: 'smoke-test',
      status: 'DRAFT',
      category: 'OTHER',
      tags: ['ts'],
      releaseDate: '2024-01-15',
      revisionDate: '2024-01-15',
      authorId: authorUuid,
      updatedAt: now,
    });

    const stored = await db.select().from(posts);

    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      uuid: postUuid,
      title: 'Smoke Test Post',
      authorId: authorUuid,
    });
  });

  it('truncates all tables between tests', async () => {
    const db = getTestDb();

    const remainingPosts = await db.select().from(posts);
    const remainingAuthors = await db.select().from(authors);

    expect(remainingPosts).toEqual([]);
    expect(remainingAuthors).toEqual([]);
  });
});

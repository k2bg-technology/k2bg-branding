import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { Category, PostType, ReleaseDate } from '../../../../domain';
import {
  createPost,
  createPosts,
} from '../../../../use-cases/shared/testing/factories';
import { createDrizzleAuthorRow } from '../../../shared';
import {
  getTestDb,
  truncateAllTables,
} from '../../../shared/testing/testDatabase';
import { toPersistence } from '../../repositories/drizzle/mapper';
import { DrizzleFetchPostSummariesByCategoryQueryService } from './fetchPostSummariesByCategoryQueryService';

async function seedAuthor() {
  const db = getTestDb();
  const author = createDrizzleAuthorRow();
  await db.insert(authors).values({
    uuid: author.uuid,
    name: author.name,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
  });
  return author;
}

async function insertPost(post: ReturnType<typeof createPost>) {
  await getTestDb().insert(posts).values(toPersistence(post));
}

describe('DrizzleFetchPostSummariesByCategoryQueryService', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('returns only articles in the requested category with total count', async () => {
    await seedAuthor();
    await insertPost(
      createPost({
        id: createPost().id,
        category: Category.ENGINEERING,
      })
    );
    // Different uuid + slug for the second article
    await getTestDb()
      .insert(posts)
      .values({
        ...toPersistence(createPost({ category: Category.ENGINEERING })),
        uuid: '550e8400-e29b-41d4-a716-446655440002',
        slug: 'eng-2',
      });
    await getTestDb()
      .insert(posts)
      .values({
        ...toPersistence(createPost({ category: Category.DESIGN })),
        uuid: '550e8400-e29b-41d4-a716-446655440003',
        slug: 'design-1',
      });
    const sut = new DrizzleFetchPostSummariesByCategoryQueryService(
      getTestDb()
    );

    const result = await sut.fetchPostSummariesByCategory({
      category: Category.ENGINEERING,
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result.totalCount).toBe(2);
    expect(result.posts).toHaveLength(2);
    expect(
      result.posts.every((post) => post.category === Category.ENGINEERING)
    ).toBe(true);
  });

  it('excludes PAGE-type posts even when the category matches', async () => {
    await seedAuthor();
    await getTestDb()
      .insert(posts)
      .values(
        toPersistence(
          createPost({ category: Category.ENGINEERING, type: PostType.PAGE })
        )
      );
    const sut = new DrizzleFetchPostSummariesByCategoryQueryService(
      getTestDb()
    );

    const result = await sut.fetchPostSummariesByCategory({
      category: Category.ENGINEERING,
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result).toEqual({ posts: [], totalCount: 0 });
  });

  it('orders by uuid as a stable tiebreaker when releaseDate ties', async () => {
    await seedAuthor();
    const sharedDate = ReleaseDate.create('2024-01-10');
    const articles = createPosts(4, {
      category: Category.ENGINEERING,
      releaseDate: sharedDate,
    });
    await getTestDb()
      .insert(posts)
      .values(articles.map((post) => toPersistence(post)));
    const sut = new DrizzleFetchPostSummariesByCategoryQueryService(
      getTestDb()
    );

    const page1 = await sut.fetchPostSummariesByCategory({
      category: Category.ENGINEERING,
      page: 1,
      pageSize: 2,
      orderBy: 'desc',
    });
    const page2 = await sut.fetchPostSummariesByCategory({
      category: Category.ENGINEERING,
      page: 2,
      pageSize: 2,
      orderBy: 'desc',
    });

    const expectedDescIds = articles
      .map((post) => post.id.getValue())
      .sort()
      .reverse();
    expect(page1.posts.map((p) => p.id)).toEqual(expectedDescIds.slice(0, 2));
    expect(page2.posts.map((p) => p.id)).toEqual(expectedDescIds.slice(2, 4));
    const combinedIds = [...page1.posts, ...page2.posts].map((p) => p.id);
    expect(new Set(combinedIds).size).toBe(4);
  });

  it('returns an empty page when the category has no posts', async () => {
    await seedAuthor();
    await getTestDb()
      .insert(posts)
      .values(toPersistence(createPost({ category: Category.ENGINEERING })));
    const sut = new DrizzleFetchPostSummariesByCategoryQueryService(
      getTestDb()
    );

    const result = await sut.fetchPostSummariesByCategory({
      category: Category.LIFE_STYLE,
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result).toEqual({ posts: [], totalCount: 0 });
  });
});

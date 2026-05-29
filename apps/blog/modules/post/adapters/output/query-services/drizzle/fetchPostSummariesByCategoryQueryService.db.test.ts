import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { Category, PostType } from '../../../../domain';
import { createPost } from '../../../../use-cases/shared/testing/factories';
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

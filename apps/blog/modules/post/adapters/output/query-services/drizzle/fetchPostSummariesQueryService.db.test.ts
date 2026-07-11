import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { PostStatus, PostType, ReleaseDate, Slug } from '../../../../domain';
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
import { DrizzleFetchPostSummariesQueryService } from './fetchPostSummariesQueryService';

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

describe('DrizzleFetchPostSummariesQueryService', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('returns a page of ARTICLE summaries with total count', async () => {
    await seedAuthor();
    const db = getTestDb();
    const articles = createPosts(3).map((post, index) =>
      createPost({
        id: post.id,
        slug: post.slug,
        releaseDate: ReleaseDate.create(`2024-01-${15 - index}`),
      })
    );
    for (const post of articles) {
      await db.insert(posts).values(toPersistence(post));
    }
    const sut = new DrizzleFetchPostSummariesQueryService(db);

    const result = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result.totalCount).toBe(3);
    expect(result.posts).toHaveLength(3);
    expect(result.posts[0]).toMatchObject({
      title: articles[0].title.getValue(),
      slug: `${articles[0].id.getValue()}/${articles[0].slug.getValue()}`,
      author: {
        id: articles[0].authorId.getValue(),
        name: 'Test Author',
      },
    });
  });

  it('excludes posts whose type is PAGE', async () => {
    await seedAuthor();
    const db = getTestDb();
    const article = createPost();
    const page = createPost({
      id: article.id,
      slug: Slug.create('page-slug'),
      type: PostType.PAGE,
    });
    // Use a fresh id to avoid clobbering the article on insert.
    await db.insert(posts).values(toPersistence(article));
    await db.insert(posts).values({
      ...toPersistence(page),
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'page-only',
    });
    const sut = new DrizzleFetchPostSummariesQueryService(db);

    const result = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result.totalCount).toBe(1);
    expect(result.posts.map((p) => p.id)).toEqual([article.id.getValue()]);
  });

  it('excludes posts whose status is not the requested status', async () => {
    await seedAuthor();
    const db = getTestDb();
    const publishedArticle = createPost();
    const draftArticle = createPost({
      id: publishedArticle.id,
      slug: Slug.create('draft-slug'),
      status: PostStatus.DRAFT,
    });
    // Use a fresh id to avoid clobbering the published article on insert.
    await db.insert(posts).values(toPersistence(publishedArticle));
    await db.insert(posts).values({
      ...toPersistence(draftArticle),
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'draft-only',
    });
    const sut = new DrizzleFetchPostSummariesQueryService(db);

    const result = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
      status: PostStatus.PUBLISHED,
    });

    expect(result.totalCount).toBe(1);
    expect(result.posts.map((p) => p.id)).toEqual([
      publishedArticle.id.getValue(),
    ]);
  });

  it('paginates with limit and offset and orders by releaseDate', async () => {
    await seedAuthor();
    const db = getTestDb();
    const articles = createPosts(5).map((post, index) =>
      createPost({
        id: post.id,
        slug: post.slug,
        releaseDate: ReleaseDate.create(`2024-01-${10 + index}`),
      })
    );
    for (const post of articles) {
      await db.insert(posts).values(toPersistence(post));
    }
    const sut = new DrizzleFetchPostSummariesQueryService(db);

    const ascPage1 = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 2,
      orderBy: 'asc',
    });
    const ascPage2 = await sut.fetchPostSummaries({
      page: 2,
      pageSize: 2,
      orderBy: 'asc',
    });
    const descPage1 = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 2,
      orderBy: 'desc',
    });

    expect(ascPage1.totalCount).toBe(5);
    expect(ascPage1.posts.map((p) => p.releaseDate)).toEqual([
      '2024-01-10',
      '2024-01-11',
    ]);
    expect(ascPage2.posts.map((p) => p.releaseDate)).toEqual([
      '2024-01-12',
      '2024-01-13',
    ]);
    expect(descPage1.posts.map((p) => p.releaseDate)).toEqual([
      '2024-01-14',
      '2024-01-13',
    ]);
  });

  it('orders by uuid as a stable tiebreaker when releaseDate ties', async () => {
    await seedAuthor();
    const db = getTestDb();
    const sharedDate = ReleaseDate.create('2024-01-10');
    const articles = createPosts(4, { releaseDate: sharedDate });
    for (const post of articles) {
      await db.insert(posts).values(toPersistence(post));
    }
    const sut = new DrizzleFetchPostSummariesQueryService(db);

    const page1 = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 2,
      orderBy: 'desc',
    });
    const page2 = await sut.fetchPostSummaries({
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

  it('returns an empty page and zero total when no posts exist', async () => {
    const sut = new DrizzleFetchPostSummariesQueryService(getTestDb());

    const result = await sut.fetchPostSummaries({
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result).toEqual({ posts: [], totalCount: 0 });
  });
});

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { PostType, ReleaseDate, Title } from '../../../../domain';
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
import { DrizzleSearchPostSummariesQueryService } from './searchPostSummariesQueryService';

async function seedAuthor() {
  const db = getTestDb();
  const author = createDrizzleAuthorRow();
  await db.insert(authors).values({
    uuid: author.uuid,
    name: author.name,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
  });
}

async function insertArticle(
  uuid: string,
  title: string,
  options: {
    type?: PostType;
  } = {}
) {
  const post = createPost({
    title: Title.create(title),
    type: options.type ?? PostType.ARTICLE,
  });
  await getTestDb()
    .insert(posts)
    .values({ ...toPersistence(post), uuid, slug: `slug-${uuid.slice(0, 4)}` });
}

describe('DrizzleSearchPostSummariesQueryService', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('matches title case-insensitively (ILIKE)', async () => {
    await seedAuthor();
    await insertArticle(
      '550e8400-e29b-41d4-a716-446655440010',
      'TypeScript Tips'
    );
    await insertArticle('550e8400-e29b-41d4-a716-446655440011', 'react hooks');
    const sut = new DrizzleSearchPostSummariesQueryService(getTestDb());

    const result = await sut.searchPostSummaries({
      query: 'TYPESCRIPT',
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result.totalCount).toBe(1);
    expect(result.posts[0].title).toBe('TypeScript Tips');
  });

  it('treats % and _ in the query as literal characters via escapeLike', async () => {
    await seedAuthor();
    await insertArticle(
      '550e8400-e29b-41d4-a716-446655440020',
      'Profit jumped 50% in Q2'
    );
    await insertArticle(
      '550e8400-e29b-41d4-a716-446655440021',
      'Plain headline with no special chars'
    );
    const sut = new DrizzleSearchPostSummariesQueryService(getTestDb());

    const literalMatch = await sut.searchPostSummaries({
      query: '50%',
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });
    expect(literalMatch.posts.map((post) => post.title)).toEqual([
      'Profit jumped 50% in Q2',
    ]);

    const noWildcardOverreach = await sut.searchPostSummaries({
      query: 'doesnotexist%',
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });
    expect(noWildcardOverreach.totalCount).toBe(0);
  });

  it('excludes PAGE-type posts even when the title matches', async () => {
    await seedAuthor();
    await insertArticle(
      '550e8400-e29b-41d4-a716-446655440030',
      'Doc Page Heading',
      { type: PostType.PAGE }
    );
    const sut = new DrizzleSearchPostSummariesQueryService(getTestDb());

    const result = await sut.searchPostSummaries({
      query: 'Doc',
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result).toEqual({ posts: [], totalCount: 0 });
  });

  it('orders by uuid as a stable tiebreaker when releaseDate ties', async () => {
    await seedAuthor();
    const db = getTestDb();
    const sharedDate = ReleaseDate.create('2024-01-10');
    const articles = createPosts(4, {
      title: Title.create('Tiebreaker Match'),
      releaseDate: sharedDate,
    });
    for (const post of articles) {
      await db.insert(posts).values(toPersistence(post));
    }
    const sut = new DrizzleSearchPostSummariesQueryService(db);

    const page1 = await sut.searchPostSummaries({
      query: 'Tiebreaker',
      page: 1,
      pageSize: 2,
      orderBy: 'desc',
    });
    const page2 = await sut.searchPostSummaries({
      query: 'Tiebreaker',
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

  it('returns an empty page when nothing matches', async () => {
    const sut = new DrizzleSearchPostSummariesQueryService(getTestDb());

    const result = await sut.searchPostSummaries({
      query: 'anything',
      page: 1,
      pageSize: 10,
      orderBy: 'desc',
    });

    expect(result).toEqual({ posts: [], totalCount: 0 });
  });
});

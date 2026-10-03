import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import {
  PostStatus,
  PostType,
  ReleaseDate,
  RevisionDate,
} from '../../../../domain';
import { createPost } from '../../../../use-cases/shared/testing/factories';
import { createDrizzleAuthorRow } from '../../../shared';
import {
  getTestDb,
  truncateAllTables,
} from '../../../shared/testing/testDatabase';
import { toPersistence } from '../../repositories/drizzle/mapper';
import { DrizzleFetchAllSlugsQueryService } from './fetchAllSlugsQueryService';

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

describe('DrizzleFetchAllSlugsQueryService', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('returns id, slug, and revisionDate for every ARTICLE in releaseDate order', async () => {
    await seedAuthor();
    const db = getTestDb();
    const post1 = createPost({
      releaseDate: ReleaseDate.create('2024-01-10'),
      revisionDate: RevisionDate.create('2024-01-11'),
    });
    await db.insert(posts).values(toPersistence(post1));
    const post2 = createPost({
      releaseDate: ReleaseDate.create('2024-01-15'),
      revisionDate: RevisionDate.create('2024-01-20'),
    });
    await db.insert(posts).values({
      ...toPersistence(post2),
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      slug: 'second-article',
    });
    const sut = new DrizzleFetchAllSlugsQueryService(db);

    const ascResult = await sut.fetchAllSlugs({ orderBy: 'asc' });
    const descResult = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(ascResult).toEqual([
      {
        id: post1.id.getValue(),
        slug: post1.slug.getValue(),
        revisionDate: post1.revisionDate.toISOString(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        slug: 'second-article',
        revisionDate: post2.revisionDate.toISOString(),
      },
    ]);
    expect(descResult).toEqual([
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        slug: 'second-article',
        revisionDate: post2.revisionDate.toISOString(),
      },
      {
        id: post1.id.getValue(),
        slug: post1.slug.getValue(),
        revisionDate: post1.revisionDate.toISOString(),
      },
    ]);
  });

  it('excludes PAGE-type posts', async () => {
    await seedAuthor();
    await getTestDb()
      .insert(posts)
      .values(toPersistence(createPost({ type: PostType.PAGE })));
    const sut = new DrizzleFetchAllSlugsQueryService(getTestDb());

    const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(result).toEqual([]);
  });

  it('excludes posts whose status is not PUBLISHED', async () => {
    await seedAuthor();
    await getTestDb()
      .insert(posts)
      .values(toPersistence(createPost({ status: PostStatus.DRAFT })));
    const sut = new DrizzleFetchAllSlugsQueryService(getTestDb());

    const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(result).toEqual([]);
  });

  it('returns an empty array when there are no posts', async () => {
    const sut = new DrizzleFetchAllSlugsQueryService(getTestDb());

    const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(result).toEqual([]);
  });
});

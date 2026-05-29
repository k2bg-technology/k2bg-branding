import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { PostType, ReleaseDate } from '../../../../domain';
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

  it('returns id + slug for every ARTICLE in releaseDate order', async () => {
    await seedAuthor();
    const db = getTestDb();
    const post1 = createPost({
      releaseDate: ReleaseDate.create('2024-01-10'),
    });
    await db.insert(posts).values(toPersistence(post1));
    await db.insert(posts).values({
      ...toPersistence(
        createPost({ releaseDate: ReleaseDate.create('2024-01-15') })
      ),
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      slug: 'second-article',
    });
    const sut = new DrizzleFetchAllSlugsQueryService(db);

    const ascResult = await sut.fetchAllSlugs({ orderBy: 'asc' });
    const descResult = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(ascResult.map((row) => row.slug)).toEqual([
      post1.slug.getValue(),
      'second-article',
    ]);
    expect(descResult.map((row) => row.slug)).toEqual([
      'second-article',
      post1.slug.getValue(),
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

  it('returns an empty array when there are no posts', async () => {
    const sut = new DrizzleFetchAllSlugsQueryService(getTestDb());

    const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

    expect(result).toEqual([]);
  });
});

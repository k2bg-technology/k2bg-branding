import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { PostId } from '../../../../domain';
import { createPost } from '../../../../use-cases/shared/testing/factories';
import {
  createDrizzleAuthorRow,
  type DrizzlePostRowWithAuthor,
} from '../../../shared';
import {
  getTestDb,
  truncateAllTables,
} from '../../../shared/testing/testDatabase';
import { toPersistence } from '../../repositories/drizzle/mapper';
import { DrizzleFetchPostQueryService } from './fetchPostQueryService';

async function seedAuthorAndPost(
  options: {
    author?: Parameters<typeof createDrizzleAuthorRow>[0];
    postOverrides?: Parameters<typeof createPost>[0];
  } = {}
): Promise<{ postUuid: string; authorUuid: string }> {
  const db = getTestDb();
  const author = createDrizzleAuthorRow(options.author);
  await db.insert(authors).values({
    uuid: author.uuid,
    name: author.name,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
  });

  const post = createPost(options.postOverrides);
  await db.insert(posts).values(toPersistence(post));
  return { postUuid: post.id.getValue(), authorUuid: author.uuid };
}

describe('DrizzleFetchPostQueryService', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  it('returns the post and author when the post exists', async () => {
    const { postUuid, authorUuid } = await seedAuthorAndPost();
    const sut = new DrizzleFetchPostQueryService(getTestDb());

    const result = await sut.fetchPost(PostId.create(postUuid));

    expect(result).not.toBeNull();
    expect(result?.post.id.getValue()).toBe(postUuid);
    expect(result?.author).toEqual({
      id: authorUuid,
      name: 'Test Author',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
  });

  it('returns null when the post does not exist', async () => {
    const sut = new DrizzleFetchPostQueryService(getTestDb());

    const result = await sut.fetchPost(
      PostId.create('00000000-0000-4000-a000-000000000003')
    );

    expect(result).toBeNull();
  });

  it('returns the post with author.avatarUrl null when the author has none', async () => {
    const { postUuid } = await seedAuthorAndPost({
      author: { avatarUrl: null } satisfies Partial<
        DrizzlePostRowWithAuthor['author']
      >,
    });
    const sut = new DrizzleFetchPostQueryService(getTestDb());

    const result = await sut.fetchPost(PostId.create(postUuid));

    expect(result?.author?.avatarUrl).toBeNull();
  });
});

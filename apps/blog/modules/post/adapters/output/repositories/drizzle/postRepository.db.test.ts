import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { PostId, Title } from '../../../../domain';
import { createPost } from '../../../../use-cases/shared/testing/factories';
import { createDrizzleAuthorRow, RepositoryError } from '../../../shared';
import {
  getTestDb,
  truncateAllTables,
} from '../../../shared/testing/testDatabase';
import { DrizzlePostRepository } from './postRepository';

async function insertAuthor(
  overrides: Parameters<typeof createDrizzleAuthorRow>[0] = {}
) {
  const db = getTestDb();
  const author = createDrizzleAuthorRow(overrides);
  await db.insert(authors).values({
    uuid: author.uuid,
    name: author.name,
    avatarUrl: author.avatarUrl,
    updatedAt: author.updatedAt,
  });
  return author;
}

describe('DrizzlePostRepository', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  describe('findById', () => {
    it('returns Post when found', async () => {
      await insertAuthor();
      const sut = new DrizzlePostRepository(getTestDb());
      const post = createPost();
      await sut.save(post);

      const result = await sut.findById(post.id);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(post.id.getValue());
      expect(result?.title.getValue()).toBe(post.title.getValue());
      expect(result?.authorId.getValue()).toBe(post.authorId.getValue());
    });

    it('returns null when not found', async () => {
      const sut = new DrizzlePostRepository(getTestDb());

      const result = await sut.findById(
        PostId.create('00000000-0000-4000-a000-000000000001')
      );

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('inserts a new post', async () => {
      await insertAuthor();
      const sut = new DrizzlePostRepository(getTestDb());
      const post = createPost();

      await sut.save(post);

      const [stored] = await getTestDb()
        .select()
        .from(posts)
        .where(eq(posts.uuid, post.id.getValue()));
      expect(stored).toMatchObject({
        uuid: post.id.getValue(),
        title: post.title.getValue(),
        authorId: post.authorId.getValue(),
        slug: post.slug.getValue(),
      });
    });

    it('updates an existing post by uuid', async () => {
      await insertAuthor();
      const sut = new DrizzlePostRepository(getTestDb());
      const original = createPost();
      await sut.save(original);

      const updatedTitleValue = 'Updated Title';
      const updatedAt = new Date('2024-02-01T00:00:00.000Z');
      const revised = createPost({
        title: Title.create(updatedTitleValue),
        updatedAt,
      });
      await sut.save(revised);

      const [stored] = await getTestDb()
        .select()
        .from(posts)
        .where(eq(posts.uuid, original.id.getValue()));
      expect(stored.title).toBe(updatedTitleValue);
      expect(stored.updatedAt).toEqual(updatedAt);
      const allRows = await getTestDb()
        .select()
        .from(posts)
        .where(eq(posts.uuid, original.id.getValue()));
      expect(allRows).toHaveLength(1);
    });

    it('throws RepositoryError when authorId does not match an existing author', async () => {
      const sut = new DrizzlePostRepository(getTestDb());
      const post = createPost();

      await expect(sut.save(post)).rejects.toThrow(RepositoryError);
    });
  });

  describe('delete', () => {
    it('removes the post by id', async () => {
      await insertAuthor();
      const sut = new DrizzlePostRepository(getTestDb());
      const post = createPost();
      await sut.save(post);

      await sut.delete(post.id);

      const stored = await getTestDb()
        .select()
        .from(posts)
        .where(eq(posts.uuid, post.id.getValue()));
      expect(stored).toEqual([]);
    });

    it('is a no-op when the post does not exist', async () => {
      const sut = new DrizzlePostRepository(getTestDb());

      await expect(
        sut.delete(PostId.create('00000000-0000-4000-a000-000000000002'))
      ).resolves.toBeUndefined();
    });
  });
});

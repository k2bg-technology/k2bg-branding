import { count, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import { Title } from '../../../../domain';
import {
  createPost,
  createPosts,
} from '../../../../use-cases/shared/testing/factories';
import {
  getTestDb,
  truncateAllTables,
} from '../../../shared/testing/testDatabase';
import { DrizzlePostBatchRepository } from './postBatchRepository';

describe('DrizzlePostBatchRepository', () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  describe('upsertAll', () => {
    it('does nothing when posts array is empty', async () => {
      const sut = new DrizzlePostBatchRepository(getTestDb());

      await sut.upsertAll([]);

      const [postCount] = await getTestDb()
        .select({ value: count() })
        .from(posts);
      const [authorCount] = await getTestDb()
        .select({ value: count() })
        .from(authors);
      expect(postCount.value).toBe(0);
      expect(authorCount.value).toBe(0);
    });

    it('inserts every post and creates a stand-in author when the UUID is new', async () => {
      const sut = new DrizzlePostBatchRepository(getTestDb());
      const newPosts = createPosts(3);

      await sut.upsertAll(newPosts);

      const storedPosts = await getTestDb().select().from(posts);
      const storedAuthors = await getTestDb().select().from(authors);
      expect(storedPosts).toHaveLength(3);
      expect(storedAuthors).toHaveLength(1);
      expect(storedAuthors[0]).toMatchObject({
        uuid: newPosts[0].authorId.getValue(),
        name: 'Unknown Author',
      });
    });

    it('updates posts that already exist by uuid without duplicating the author row', async () => {
      const sut = new DrizzlePostBatchRepository(getTestDb());
      const original = createPost();
      await sut.upsertAll([original]);

      const revisedTitle = 'Revised in Batch';
      const revised = createPost({ title: Title.create(revisedTitle) });
      await sut.upsertAll([revised]);

      const [storedPost] = await getTestDb()
        .select()
        .from(posts)
        .where(eq(posts.uuid, original.id.getValue()));
      const storedAuthors = await getTestDb().select().from(authors);
      expect(storedPost.title).toBe(revisedTitle);
      expect(storedAuthors).toHaveLength(1);
    });

    it('preserves a pre-existing author name instead of overwriting it', async () => {
      const db = getTestDb();
      const realName = 'Real Person';
      const post = createPost();
      await db.insert(authors).values({
        uuid: post.authorId.getValue(),
        name: realName,
        updatedAt: new Date('2024-01-15T00:00:00.000Z'),
      });

      const sut = new DrizzlePostBatchRepository(db);
      await sut.upsertAll([post]);

      const [storedAuthor] = await db
        .select()
        .from(authors)
        .where(eq(authors.uuid, post.authorId.getValue()));
      expect(storedAuthor.name).toBe(realName);
    });
  });
});

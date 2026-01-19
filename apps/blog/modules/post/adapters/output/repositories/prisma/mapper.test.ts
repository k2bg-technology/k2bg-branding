import { describe, expect, it } from 'vitest';
import {
  AuthorId,
  Category,
  Content,
  Excerpt,
  ImageUrl,
  Post,
  PostId,
  PostStatus,
  PostType,
  ReleaseDate,
  RevisionDate,
  Slug,
  Tags,
  Title,
} from '../../../../domain';
import { createPrismaPostWithAuthor } from '../../../shared';
import { toDomain, toPersistence } from './mapper';

describe('prisma/mapper', () => {
  describe('toDomain', () => {
    it('maps Prisma Post to Domain Post correctly', () => {
      const prismaPost = createPrismaPostWithAuthor();

      const result = toDomain(prismaPost);

      expect(result.id.getValue()).toBe(prismaPost.uuid);
      expect(result.title.getValue()).toBe(prismaPost.title);
      expect(result.content.getValue()).toBe(prismaPost.content);
      expect(result.type).toBe(PostType.ARTICLE);
      expect(result.excerpt.getValue()).toBe(prismaPost.excerpt);
      expect(result.imageUrl.getValue()).toBe(prismaPost.imageUrl);
      expect(result.slug.getValue()).toBe(prismaPost.slug);
      expect(result.status).toBe(PostStatus.PUBLISHED);
      expect(result.category).toBe(Category.ENGINEERING);
      expect(result.tags.getValues()).toEqual(prismaPost.tags);
      expect(result.authorId.getValue()).toBe(prismaPost.authorId);
      expect(result.releaseDate.toISOString()).toBe(prismaPost.releaseDate);
      expect(result.revisionDate.toISOString()).toBe(prismaPost.revisionDate);
    });

    it('maps empty excerpt to Excerpt.empty()', () => {
      const prismaPost = createPrismaPostWithAuthor({ excerpt: '' });

      const result = toDomain(prismaPost);

      expect(result.excerpt.getValue()).toBeNull();
    });

    it('maps different post types correctly', () => {
      const articlePost = createPrismaPostWithAuthor({ type: 'ARTICLE' });
      const pagePost = createPrismaPostWithAuthor({ type: 'PAGE' });

      expect(toDomain(articlePost).type).toBe(PostType.ARTICLE);
      expect(toDomain(pagePost).type).toBe(PostType.PAGE);
    });

    it('maps different post statuses correctly', () => {
      const ideaPost = createPrismaPostWithAuthor({ status: 'IDEA' });
      const draftPost = createPrismaPostWithAuthor({ status: 'DRAFT' });
      const previewPost = createPrismaPostWithAuthor({ status: 'PREVIEW' });
      const publishedPost = createPrismaPostWithAuthor({ status: 'PUBLISHED' });
      const archivedPost = createPrismaPostWithAuthor({ status: 'ARCHIVED' });

      expect(toDomain(ideaPost).status).toBe(PostStatus.IDEA);
      expect(toDomain(draftPost).status).toBe(PostStatus.DRAFT);
      expect(toDomain(previewPost).status).toBe(PostStatus.PREVIEW);
      expect(toDomain(publishedPost).status).toBe(PostStatus.PUBLISHED);
      expect(toDomain(archivedPost).status).toBe(PostStatus.ARCHIVED);
    });

    it('maps different categories correctly', () => {
      const engineeringPost = createPrismaPostWithAuthor({
        category: 'ENGINEERING',
      });
      const designPost = createPrismaPostWithAuthor({ category: 'DESIGN' });
      const dataSciencePost = createPrismaPostWithAuthor({
        category: 'DATA_SCIENCE',
      });
      const lifeStylePost = createPrismaPostWithAuthor({
        category: 'LIFE_STYLE',
      });
      const otherPost = createPrismaPostWithAuthor({ category: 'OTHER' });

      expect(toDomain(engineeringPost).category).toBe(Category.ENGINEERING);
      expect(toDomain(designPost).category).toBe(Category.DESIGN);
      expect(toDomain(dataSciencePost).category).toBe(Category.DATA_SCIENCE);
      expect(toDomain(lifeStylePost).category).toBe(Category.LIFE_STYLE);
      expect(toDomain(otherPost).category).toBe(Category.OTHER);
    });
  });

  describe('toPersistence', () => {
    it('maps Domain Post to Prisma data correctly', () => {
      const post = Post.reconstitute({
        id: PostId.create('550e8400-e29b-41d4-a716-446655440000'),
        title: Title.create('Test Title'),
        content: Content.create('Test content'),
        type: PostType.ARTICLE,
        excerpt: Excerpt.create('Test excerpt'),
        imageUrl: ImageUrl.create('https://example.com/image.jpg'),
        slug: Slug.create('test-slug'),
        status: PostStatus.PUBLISHED,
        category: Category.ENGINEERING,
        tags: Tags.create(['typescript', 'testing']),
        authorId: AuthorId.create('660e8400-e29b-41d4-a716-446655440000'),
        releaseDate: ReleaseDate.create('2024-01-15'),
        revisionDate: RevisionDate.create('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        deletedAt: null,
      });

      const result = toPersistence(post);

      expect(result.uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.title).toBe('Test Title');
      expect(result.content).toBe('Test content');
      expect(result.type).toBe('ARTICLE');
      expect(result.excerpt).toBe('Test excerpt');
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.slug).toBe('test-slug');
      expect(result.status).toBe('PUBLISHED');
      expect(result.category).toBe('ENGINEERING');
      expect(result.tags).toEqual(['typescript', 'testing']);
      expect(result.authorId).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(result.releaseDate).toBe('2024-01-15');
      expect(result.revisionDate).toBe('2024-01-15');
    });

    it('maps empty excerpt to empty string', () => {
      const post = Post.reconstitute({
        id: PostId.create('550e8400-e29b-41d4-a716-446655440000'),
        title: Title.create('Test Title'),
        content: Content.create('Test content'),
        type: PostType.ARTICLE,
        excerpt: Excerpt.empty(),
        imageUrl: ImageUrl.create('https://example.com/image.jpg'),
        slug: Slug.create('test-slug'),
        status: PostStatus.PUBLISHED,
        category: Category.ENGINEERING,
        tags: Tags.create(['typescript']),
        authorId: AuthorId.create('660e8400-e29b-41d4-a716-446655440000'),
        releaseDate: ReleaseDate.create('2024-01-15'),
        revisionDate: RevisionDate.create('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        deletedAt: null,
      });

      const result = toPersistence(post);

      expect(result.excerpt).toBe('');
    });
  });
});

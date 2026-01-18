import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CannotModifyArchivedPostError,
  CannotPublishArchivedPostError,
  FutureReleaseDateError,
  PostAlreadyArchivedError,
  PostAlreadyPublishedError,
  PostInvariantViolationError,
  RevisionDateBeforeReleaseDateError,
} from '../errors/errors';
import { Category, PostStatus, PostType } from '../types/enums';
import { AuthorId } from '../value-objects/authorId';
import { Content } from '../value-objects/content';
import { Excerpt } from '../value-objects/excerpt';
import { ImageUrl } from '../value-objects/imageUrl';
import { PostId } from '../value-objects/postId';
import { ReleaseDate } from '../value-objects/releaseDate';
import { RevisionDate } from '../value-objects/revisionDate';
import { Slug } from '../value-objects/slug';
import { Tags } from '../value-objects/tags';
import { Title } from '../value-objects/title';
import { type CreateDraftProps, Post, type PostProps } from './entity';

// =============================================================================
// Test Helpers
// =============================================================================

function createValidDraftParams(
  overrides: Partial<CreateDraftProps> = {}
): CreateDraftProps {
  return {
    title: Title.create('Test Post Title'),
    content: Content.create('This is the test post content.'),
    type: PostType.ARTICLE,
    imageUrl: ImageUrl.create('https://example.com/image.jpg'),
    slug: Slug.create('test-post'),
    category: Category.ENGINEERING,
    authorId: AuthorId.create('660e8400-e29b-41d4-a716-446655440000'),
    releaseDate: ReleaseDate.create('2024-01-15'),
    ...overrides,
  };
}

function createDraftPost(overrides: Partial<CreateDraftProps> = {}): Post {
  return Post.createDraft(createValidDraftParams(overrides));
}

function createValidPostProps(overrides: Partial<PostProps> = {}): PostProps {
  return {
    id: PostId.create('550e8400-e29b-41d4-a716-446655440000'),
    title: Title.create('Test Post Title'),
    content: Content.create('This is the test post content.'),
    type: PostType.ARTICLE,
    excerpt: Excerpt.empty(),
    imageUrl: ImageUrl.create('https://example.com/image.jpg'),
    slug: Slug.create('test-post'),
    status: PostStatus.DRAFT,
    category: Category.ENGINEERING,
    tags: Tags.empty(),
    authorId: AuthorId.create('660e8400-e29b-41d4-a716-446655440000'),
    releaseDate: ReleaseDate.create('2024-01-15'),
    revisionDate: RevisionDate.create('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    deletedAt: null,
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('Post', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createDraft', () => {
    it('creates draft post with DRAFT status', () => {
      const params = createValidDraftParams();

      const sut = Post.createDraft(params);

      expect(sut.status).toBe(PostStatus.DRAFT);
    });

    it('generates unique PostId', () => {
      const params = createValidDraftParams();

      const post1 = Post.createDraft(params);
      const post2 = Post.createDraft(params);

      expect(post1.id.equals(post2.id)).toBe(false);
    });

    it('sets revisionDate equal to releaseDate', () => {
      const releaseDate = ReleaseDate.create('2024-01-15');
      const params = createValidDraftParams({ releaseDate });

      const sut = Post.createDraft(params);

      expect(sut.revisionDate.toISOString()).toBe('2024-01-15');
    });

    it('uses empty Excerpt when not provided', () => {
      const params = createValidDraftParams();

      const sut = Post.createDraft(params);

      expect(sut.excerpt.hasValue()).toBe(false);
    });

    it('uses empty Tags when not provided', () => {
      const params = createValidDraftParams();

      const sut = Post.createDraft(params);

      expect(sut.tags.isEmpty()).toBe(true);
    });

    it('sets createdAt and updatedAt to current time', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
      const params = createValidDraftParams();

      const sut = Post.createDraft(params);

      expect(sut.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
      expect(sut.updatedAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('sets deletedAt to null', () => {
      const params = createValidDraftParams();

      const sut = Post.createDraft(params);

      expect(sut.deletedAt).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('creates Post from valid props', () => {
      const props = createValidPostProps();

      const sut = Post.reconstitute(props);

      expect(sut.id.getValue()).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(sut.status).toBe(PostStatus.DRAFT);
    });

    it('throws PostInvariantViolationError when revisionDate before releaseDate', () => {
      const props = createValidPostProps({
        releaseDate: ReleaseDate.create('2024-01-20'),
        revisionDate: RevisionDate.create('2024-01-15'),
      });

      expect(() => Post.reconstitute(props)).toThrow(
        PostInvariantViolationError
      );
      expect(() => Post.reconstitute(props)).toThrow(
        'revisionDate must be on or after releaseDate'
      );
    });

    it('throws PostInvariantViolationError when published post has future releaseDate', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const props = createValidPostProps({
        status: PostStatus.PUBLISHED,
        releaseDate: ReleaseDate.create('2024-01-20'),
        revisionDate: RevisionDate.create('2024-01-20'),
      });

      expect(() => Post.reconstitute(props)).toThrow(
        PostInvariantViolationError
      );
      expect(() => Post.reconstitute(props)).toThrow(
        'cannot have future release date'
      );
    });
  });

  describe('publish', () => {
    it('changes status to PUBLISHED when publishing draft', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-20'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-15'),
      });

      sut.publish();

      expect(sut.status).toBe(PostStatus.PUBLISHED);
    });

    it('updates updatedAt when publishing', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-15'),
      });

      vi.setSystemTime(new Date('2024-01-20'));
      sut.publish();

      expect(sut.updatedAt.toISOString()).toBe('2024-01-20T00:00:00.000Z');
    });

    it('throws PostAlreadyPublishedError when already published', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-20'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-15'),
      });
      sut.publish();

      expect(() => sut.publish()).toThrow(PostAlreadyPublishedError);
    });

    it('throws CannotPublishArchivedPostError when archived', () => {
      const sut = createDraftPost();
      sut.archive();

      expect(() => sut.publish()).toThrow(CannotPublishArchivedPostError);
    });

    it('throws FutureReleaseDateError when release date is in future', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-20'),
      });

      expect(() => sut.publish()).toThrow(FutureReleaseDateError);
    });
  });

  describe('archive', () => {
    it('changes status to ARCHIVED', () => {
      const sut = createDraftPost();

      sut.archive();

      expect(sut.status).toBe(PostStatus.ARCHIVED);
    });

    it('throws PostAlreadyArchivedError when already archived', () => {
      const sut = createDraftPost();
      sut.archive();

      expect(() => sut.archive()).toThrow(PostAlreadyArchivedError);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt to current time', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
      const sut = createDraftPost();

      sut.softDelete();

      expect(sut.deletedAt?.toISOString()).toBe('2024-01-15T10:00:00.000Z');
      expect(sut.isDeleted()).toBe(true);
    });
  });

  describe('restore', () => {
    it('clears deletedAt', () => {
      const sut = createDraftPost();
      sut.softDelete();

      sut.restore();

      expect(sut.deletedAt).toBeNull();
      expect(sut.isDeleted()).toBe(false);
    });
  });

  describe('updateContent', () => {
    it('updates title, content, and excerpt', () => {
      const sut = createDraftPost();
      const newTitle = Title.create('New Title');
      const newContent = Content.create('New content');
      const newExcerpt = Excerpt.create('New excerpt');

      sut.updateContent(newTitle, newContent, newExcerpt);

      expect(sut.title.getValue()).toBe('New Title');
      expect(sut.content.getValue()).toBe('New content');
      expect(sut.excerpt.getValue()).toBe('New excerpt');
    });

    it('throws CannotModifyArchivedPostError when archived', () => {
      const sut = createDraftPost();
      sut.archive();

      expect(() =>
        sut.updateContent(
          Title.create('New'),
          Content.create('New'),
          Excerpt.empty()
        )
      ).toThrow(CannotModifyArchivedPostError);
    });
  });

  describe('updateDates', () => {
    it('updates releaseDate and revisionDate', () => {
      const sut = createDraftPost();
      const newReleaseDate = ReleaseDate.create('2024-02-01');
      const newRevisionDate = RevisionDate.create('2024-02-15');

      sut.updateDates(newReleaseDate, newRevisionDate);

      expect(sut.releaseDate.toISOString()).toBe('2024-02-01');
      expect(sut.revisionDate.toISOString()).toBe('2024-02-15');
    });

    it('throws RevisionDateBeforeReleaseDateError when revision before release', () => {
      const sut = createDraftPost();
      const releaseDate = ReleaseDate.create('2024-02-15');
      const revisionDate = RevisionDate.create('2024-02-01');

      expect(() => sut.updateDates(releaseDate, revisionDate)).toThrow(
        RevisionDateBeforeReleaseDateError
      );
    });
  });

  describe('updateStatus', () => {
    it('changes to PREVIEW status', () => {
      const sut = createDraftPost();

      sut.updateStatus(PostStatus.PREVIEW);

      expect(sut.status).toBe(PostStatus.PREVIEW);
    });

    it('calls publish when changing to PUBLISHED', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-20'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-15'),
      });

      sut.updateStatus(PostStatus.PUBLISHED);

      expect(sut.status).toBe(PostStatus.PUBLISHED);
    });

    it('calls archive when changing to ARCHIVED', () => {
      const sut = createDraftPost();

      sut.updateStatus(PostStatus.ARCHIVED);

      expect(sut.status).toBe(PostStatus.ARCHIVED);
    });
  });

  describe('query methods', () => {
    it('isPublished returns true when published', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-20'));
      const sut = createDraftPost({
        releaseDate: ReleaseDate.create('2024-01-15'),
      });
      sut.publish();

      expect(sut.isPublished()).toBe(true);
    });

    it('isArchived returns true when archived', () => {
      const sut = createDraftPost();
      sut.archive();

      expect(sut.isArchived()).toBe(true);
    });

    it('isDraft returns true when draft', () => {
      const sut = createDraftPost();

      expect(sut.isDraft()).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true when comparing posts with same id', () => {
      const id = PostId.create('550e8400-e29b-41d4-a716-446655440000');
      const post1 = Post.reconstitute(createValidPostProps({ id }));
      const post2 = Post.reconstitute(createValidPostProps({ id }));

      const result = post1.equals(post2);

      expect(result).toBe(true);
    });

    it('returns false when comparing posts with different ids', () => {
      const post1 = createDraftPost();
      const post2 = createDraftPost();

      const result = post1.equals(post2);

      expect(result).toBe(false);
    });
  });
});

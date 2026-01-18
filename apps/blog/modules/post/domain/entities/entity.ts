import {
  CannotModifyArchivedPostError,
  CannotPublishArchivedPostError,
  FutureReleaseDateError,
  PostAlreadyArchivedError,
  PostAlreadyPublishedError,
  PostInvariantViolationError,
  RevisionDateBeforeReleaseDateError,
} from '../errors/errors';
import { type Category, PostStatus, type PostType } from '../types/enums';
import type { AuthorId } from '../value-objects/authorId';
import type { Content } from '../value-objects/content';
import { Excerpt } from '../value-objects/excerpt';
import type { ImageUrl } from '../value-objects/imageUrl';
import { PostId } from '../value-objects/postId';
import type { ReleaseDate } from '../value-objects/releaseDate';
import { RevisionDate } from '../value-objects/revisionDate';
import type { Slug } from '../value-objects/slug';
import { Tags } from '../value-objects/tags';
import type { Title } from '../value-objects/title';

/**
 * Props for reconstituting a Post from persistence
 */
export interface PostProps {
  id: PostId;
  title: Title;
  content: Content;
  type: PostType;
  excerpt: Excerpt;
  imageUrl: ImageUrl;
  slug: Slug;
  status: PostStatus;
  category: Category;
  tags: Tags;
  authorId: AuthorId;
  releaseDate: ReleaseDate;
  revisionDate: RevisionDate;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Props for creating a new draft Post
 */
export interface CreateDraftProps {
  title: Title;
  content: Content;
  type: PostType;
  imageUrl: ImageUrl;
  slug: Slug;
  category: Category;
  authorId: AuthorId;
  releaseDate: ReleaseDate;
  excerpt?: Excerpt;
  tags?: Tags;
}

/**
 * Post Entity
 *
 * Aggregate root for the Post domain.
 * Contains business logic and invariant enforcement.
 */
export class Post {
  private constructor(
    private readonly _id: PostId,
    private _title: Title,
    private _content: Content,
    private readonly _type: PostType,
    private _excerpt: Excerpt,
    private _imageUrl: ImageUrl,
    private _slug: Slug,
    private _status: PostStatus,
    private _category: Category,
    private _tags: Tags,
    private readonly _authorId: AuthorId,
    private _releaseDate: ReleaseDate,
    private _revisionDate: RevisionDate,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null
  ) {}

  // ==========================================================================
  // Getters
  // ==========================================================================

  get id(): PostId {
    return this._id;
  }

  get title(): Title {
    return this._title;
  }

  get content(): Content {
    return this._content;
  }

  get type(): PostType {
    return this._type;
  }

  get excerpt(): Excerpt {
    return this._excerpt;
  }

  get imageUrl(): ImageUrl {
    return this._imageUrl;
  }

  get slug(): Slug {
    return this._slug;
  }

  get status(): PostStatus {
    return this._status;
  }

  get category(): Category {
    return this._category;
  }

  get tags(): Tags {
    return this._tags;
  }

  get authorId(): AuthorId {
    return this._authorId;
  }

  get releaseDate(): ReleaseDate {
    return this._releaseDate;
  }

  get revisionDate(): RevisionDate {
    return this._revisionDate;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get deletedAt(): Date | null {
    return this._deletedAt ? new Date(this._deletedAt) : null;
  }

  // ==========================================================================
  // Commands (State Changes)
  // ==========================================================================

  publish(): void {
    if (this._status === PostStatus.PUBLISHED) {
      throw new PostAlreadyPublishedError(this._id.getValue());
    }
    if (this._status === PostStatus.ARCHIVED) {
      throw new CannotPublishArchivedPostError(this._id.getValue());
    }
    if (this._releaseDate.isFutureDate()) {
      throw new FutureReleaseDateError();
    }
    this._status = PostStatus.PUBLISHED;
    this._updatedAt = new Date();
  }

  archive(): void {
    if (this._status === PostStatus.ARCHIVED) {
      throw new PostAlreadyArchivedError(this._id.getValue());
    }
    this._status = PostStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  updateContent(title: Title, content: Content, excerpt: Excerpt): void {
    this.ensureNotArchived();
    this._title = title;
    this._content = content;
    this._excerpt = excerpt;
    this._updatedAt = new Date();
  }

  updateImageUrl(imageUrl: ImageUrl): void {
    this.ensureNotArchived();
    this._imageUrl = imageUrl;
    this._updatedAt = new Date();
  }

  updateSlug(slug: Slug): void {
    this.ensureNotArchived();
    this._slug = slug;
    this._updatedAt = new Date();
  }

  updateCategory(category: Category): void {
    this.ensureNotArchived();
    this._category = category;
    this._updatedAt = new Date();
  }

  updateTags(tags: Tags): void {
    this.ensureNotArchived();
    this._tags = tags;
    this._updatedAt = new Date();
  }

  updateDates(releaseDate: ReleaseDate, revisionDate: RevisionDate): void {
    this.ensureNotArchived();
    if (!revisionDate.isOnOrAfter(releaseDate)) {
      throw new RevisionDateBeforeReleaseDateError();
    }
    this._releaseDate = releaseDate;
    this._revisionDate = revisionDate;
    this._updatedAt = new Date();
  }

  updateStatus(status: PostStatus): void {
    this.ensureNotArchived();
    if (status === PostStatus.PUBLISHED) {
      this.publish();
      return;
    }
    if (status === PostStatus.ARCHIVED) {
      this.archive();
      return;
    }
    this._status = status;
    this._updatedAt = new Date();
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  isPublished(): boolean {
    return this._status === PostStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this._status === PostStatus.ARCHIVED;
  }

  isDraft(): boolean {
    return this._status === PostStatus.DRAFT;
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  equals(other: Post): boolean {
    return this._id.equals(other._id);
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  private ensureNotArchived(): void {
    if (this._status === PostStatus.ARCHIVED) {
      throw new CannotModifyArchivedPostError(this._id.getValue());
    }
  }

  // ==========================================================================
  // Factory Methods
  // ==========================================================================

  static createDraft(params: CreateDraftProps): Post {
    const now = new Date();
    const revisionDate = RevisionDate.create(params.releaseDate.getValue());

    return new Post(
      PostId.generate(),
      params.title,
      params.content,
      params.type,
      params.excerpt ?? Excerpt.empty(),
      params.imageUrl,
      params.slug,
      PostStatus.DRAFT,
      params.category,
      params.tags ?? Tags.empty(),
      params.authorId,
      params.releaseDate,
      revisionDate,
      now,
      now,
      null
    );
  }

  static reconstitute(props: PostProps): Post {
    // Validate invariant: revisionDate >= releaseDate
    if (!props.revisionDate.isOnOrAfter(props.releaseDate)) {
      throw new PostInvariantViolationError(
        `Invariant violation: revisionDate must be on or after releaseDate for post ${props.id.getValue()}`
      );
    }

    // Validate invariant: published posts cannot have future release date
    if (
      props.status === PostStatus.PUBLISHED &&
      props.releaseDate.isFutureDate()
    ) {
      throw new PostInvariantViolationError(
        `Invariant violation: published post ${props.id.getValue()} cannot have future release date`
      );
    }

    return new Post(
      props.id,
      props.title,
      props.content,
      props.type,
      props.excerpt,
      props.imageUrl,
      props.slug,
      props.status,
      props.category,
      props.tags,
      props.authorId,
      props.releaseDate,
      props.revisionDate,
      props.createdAt,
      props.updatedAt,
      props.deletedAt
    );
  }
}

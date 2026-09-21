export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidPostIdError extends DomainError {}

export class InvalidAuthorIdError extends DomainError {}

export class InvalidTitleError extends DomainError {}

export class InvalidContentError extends DomainError {}

export class InvalidExcerptError extends DomainError {}

export class InvalidImageUrlError extends DomainError {}

export class InvalidSlugError extends DomainError {}

export class InvalidTagsError extends DomainError {}

export class InvalidReleaseDateError extends DomainError {}

export class InvalidRevisionDateError extends DomainError {}

export class InvalidPostStateError extends DomainError {}

export class PostInvariantViolationError extends DomainError {}

export class PostAlreadyPublishedError extends DomainError {
  constructor(postId: string) {
    super(`Post ${postId} is already published`);
  }
}

export class PostAlreadyArchivedError extends DomainError {
  constructor(postId: string) {
    super(`Post ${postId} is already archived`);
  }
}

export class CannotPublishArchivedPostError extends DomainError {
  constructor(postId: string) {
    super(`Cannot publish archived post: ${postId}`);
  }
}

export class CannotModifyArchivedPostError extends DomainError {
  constructor(postId: string) {
    super(`Cannot modify archived post: ${postId}`);
  }
}

export class FutureReleaseDateError extends DomainError {
  constructor() {
    super('Release date cannot be a future date when publishing');
  }
}

export class RevisionDateBeforeReleaseDateError extends DomainError {
  constructor() {
    super('Revision date must be on or after release date');
  }
}

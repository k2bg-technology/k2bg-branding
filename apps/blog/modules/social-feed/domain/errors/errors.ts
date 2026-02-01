/**
 * Base error class for social-feed domain errors
 */
export class SocialFeedDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SocialFeedDomainError';
  }
}

/**
 * Error thrown when an invalid PostId is provided
 */
export class InvalidPostIdError extends SocialFeedDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPostIdError';
  }
}

/**
 * Error thrown when an invalid MediaUrl is provided
 */
export class InvalidMediaUrlError extends SocialFeedDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMediaUrlError';
  }
}

/**
 * Error thrown when an invalid Permalink is provided
 */
export class InvalidPermalinkError extends SocialFeedDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPermalinkError';
  }
}

/**
 * Error thrown when an invalid MediaType is provided
 */
export class InvalidMediaTypeError extends SocialFeedDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMediaTypeError';
  }
}

/**
 * Error thrown when SocialPost creation fails due to invalid data
 */
export class InvalidSocialPostError extends SocialFeedDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSocialPostError';
  }
}

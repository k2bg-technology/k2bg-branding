/**
 * Base error for use-case layer
 */
export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a post is not found
 */
export class PostNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Post not found: ${identifier}`);
  }
}

/**
 * Thrown when pagination parameters are invalid
 */
export class InvalidPaginationError extends UseCaseError {
  constructor(message: string) {
    super(`Invalid pagination: ${message}`);
  }
}

/**
 * Thrown when search query is invalid
 */
export class InvalidSearchQueryError extends UseCaseError {
  constructor(message: string) {
    super(`Invalid search query: ${message}`);
  }
}

/**
 * Thrown when sync operation fails
 */
export class SyncError extends UseCaseError {
  constructor(message: string) {
    super(`Sync failed: ${message}`);
  }
}

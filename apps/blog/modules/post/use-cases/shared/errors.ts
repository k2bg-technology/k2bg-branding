export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PostNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Post not found: ${identifier}`);
  }
}

export class InvalidPaginationError extends UseCaseError {
  constructor(message: string) {
    super(`Invalid pagination: ${message}`);
  }
}

export class InvalidSearchQueryError extends UseCaseError {
  constructor(message: string) {
    super(`Invalid search query: ${message}`);
  }
}

export class SyncError extends UseCaseError {
  constructor(message: string) {
    super(`Sync failed: ${message}`);
  }
}

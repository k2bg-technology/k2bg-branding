/**
 * Base error class for repository operations.
 * Wraps underlying errors while preserving the original cause.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when an external source operation fails.
 */
export class ExternalSourceError extends RepositoryError {
  constructor(source: string, cause?: unknown) {
    super(`Failed to fetch from external source: ${source}`, cause);
  }
}

/**
 * Error thrown when an image upload operation fails.
 */
export class ImageUploadError extends RepositoryError {
  constructor(id: string, cause?: unknown) {
    super(`Failed to upload image: ${id}`, cause);
  }
}

/**
 * Error thrown when mapping between domain and persistence models fails.
 */
export class MappingError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(`Mapping error: ${message}`, cause);
  }
}

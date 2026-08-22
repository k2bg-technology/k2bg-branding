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
 * Error thrown when mapping a warehouse row to a read model fails.
 */
export class MappingError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(`Mapping error: ${message}`, cause);
  }
}

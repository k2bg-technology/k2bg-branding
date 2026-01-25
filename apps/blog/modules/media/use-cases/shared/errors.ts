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
 * Thrown when a media is not found
 */
export class MediaNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Media not found: ${identifier}`);
  }
}

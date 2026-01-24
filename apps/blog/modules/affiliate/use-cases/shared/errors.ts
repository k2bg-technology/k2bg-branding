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
 * Thrown when an affiliate is not found
 */
export class AffiliateNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Affiliate not found: ${identifier}`);
  }
}

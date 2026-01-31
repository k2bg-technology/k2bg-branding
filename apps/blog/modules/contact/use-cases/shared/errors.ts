/**
 * Base error class for use case operations.
 */
export class UseCaseError extends Error {
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
 * Error thrown when sending email fails.
 */
export class SendEmailError extends UseCaseError {
  constructor(cause?: unknown) {
    super('Failed to send contact email', cause);
  }
}

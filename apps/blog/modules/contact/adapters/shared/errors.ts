/**
 * Base error class for adapter operations.
 */
export class AdapterError extends Error {
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
 * Error thrown when email service operation fails.
 */
export class EmailServiceError extends AdapterError {
  constructor(service: string, cause?: unknown) {
    super(`Email service error: ${service}`, cause);
  }
}

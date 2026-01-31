/**
 * Base error class for contact operations.
 */
export class ContactError extends Error {
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
 * Error thrown when email sending fails.
 */
export class EmailSendError extends ContactError {
  constructor(cause?: unknown) {
    super('Failed to send email', cause);
  }
}

/**
 * Contact Domain Errors
 *
 * Defines errors that occur in the contact domain layer.
 * These are clearly separated from infrastructure layer errors.
 */

// =============================================================================
// Base Error
// =============================================================================

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// =============================================================================
// Value Object Errors
// =============================================================================

export class InvalidEmailError extends DomainError {}

export class InvalidNameError extends DomainError {}

export class InvalidMessageError extends DomainError {}

// =============================================================================
// Use Case Errors
// =============================================================================

export class EmailSendFailedError extends DomainError {
  constructor(reason?: string) {
    super(reason ? `Failed to send email: ${reason}` : 'Failed to send email');
  }
}

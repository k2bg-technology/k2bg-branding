/**
 * Media Domain Errors
 *
 * Defines errors that occur in the domain layer.
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

export class InvalidMediaIdError extends DomainError {}

export class InvalidMediaNameError extends DomainError {}

export class InvalidSourceUrlError extends DomainError {}

export class InvalidSourceFileError extends DomainError {}

export class InvalidTargetUrlError extends DomainError {}

export class InvalidWidthError extends DomainError {}

export class InvalidHeightError extends DomainError {}

export class InvalidExtensionError extends DomainError {}

// =============================================================================
// Entity Errors
// =============================================================================

export class InvalidMediaError extends DomainError {}

/**
 * Affiliate Domain Errors
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

export class InvalidAffiliateIdError extends DomainError {}

export class InvalidNameError extends DomainError {}

export class InvalidTargetUrlError extends DomainError {}

export class InvalidProviderError extends DomainError {}

export class InvalidProviderColorError extends DomainError {}

export class InvalidImageSourceUrlError extends DomainError {}

export class InvalidImageWidthError extends DomainError {}

export class InvalidImageHeightError extends DomainError {}

export class InvalidImageProviderError extends DomainError {}

export class InvalidSubProviderIdsError extends DomainError {}

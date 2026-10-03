export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidMediaIdError extends DomainError {}

export class InvalidMediaNameError extends DomainError {}

export class InvalidSourceUrlError extends DomainError {}

export class InvalidSourceFileError extends DomainError {}

export class InvalidTargetUrlError extends DomainError {}

export class InvalidWidthError extends DomainError {}

export class InvalidHeightError extends DomainError {}

export class InvalidExtensionError extends DomainError {}

export class InvalidMediaError extends DomainError {}

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidEmailError extends DomainError {}

export class InvalidNameError extends DomainError {}

export class InvalidMessageError extends DomainError {}

export class EmailSendError extends DomainError {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}

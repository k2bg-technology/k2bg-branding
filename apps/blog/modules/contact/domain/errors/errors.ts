export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}

export class InvalidNameError extends DomainError {
  constructor() {
    super('Name cannot be empty');
  }
}

export class InvalidMessageError extends DomainError {
  constructor() {
    super('Message cannot be empty');
  }
}

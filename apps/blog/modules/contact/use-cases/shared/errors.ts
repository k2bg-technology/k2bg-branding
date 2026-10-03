export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ContactRateLimitExceededError extends UseCaseError {
  constructor() {
    super('Contact form submission rate limit exceeded');
  }
}

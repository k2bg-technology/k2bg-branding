export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AffiliateNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Affiliate not found: ${identifier}`);
  }
}

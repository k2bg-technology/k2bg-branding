export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class MediaNotFoundError extends UseCaseError {
  constructor(identifier: string) {
    super(`Media not found: ${identifier}`);
  }
}

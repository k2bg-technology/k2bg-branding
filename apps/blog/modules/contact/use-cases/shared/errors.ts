export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SendEmailFailedError extends UseCaseError {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}

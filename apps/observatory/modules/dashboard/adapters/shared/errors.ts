export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MappingError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(`Mapping error: ${message}`, cause);
  }
}

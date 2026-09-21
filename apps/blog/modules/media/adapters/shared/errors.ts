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

export class ExternalSourceError extends RepositoryError {
  constructor(source: string, cause?: unknown) {
    super(`Failed to fetch from external source: ${source}`, cause);
  }
}

export class MappingError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(`Mapping error: ${message}`, cause);
  }
}

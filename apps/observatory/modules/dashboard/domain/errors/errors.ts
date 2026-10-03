export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AmbiguousLatestValueError extends DomainError {
  constructor(sectionId: string, column: string) {
    super(
      `Section "${sectionId}" cannot resolve the latest value for "${column}": several distinct values share the latest source time`
    );
  }
}

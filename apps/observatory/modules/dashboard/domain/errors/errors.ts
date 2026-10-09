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

export class AmbiguousSortKeyError extends DomainError {
  constructor(sectionId: string, column: string) {
    super(
      `Section "${sectionId}" cannot order by "${column}": a category has several distinct sort keys`
    );
  }
}

export class DuplicateCategoryLabelError extends DomainError {
  constructor(sectionId: string, label: string) {
    super(`Section "${sectionId}" shows two categories labelled "${label}"`);
  }
}

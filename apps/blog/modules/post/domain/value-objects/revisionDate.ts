import { InvalidRevisionDateError } from '../errors/errors';
import type { ReleaseDate } from './releaseDate';

/**
 * RevisionDate Value Object
 *
 * Represents the date when a Post was last revised.
 * Must be on or after the release date.
 */
export class RevisionDate {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  getValue(): Date {
    return new Date(this.value);
  }

  toISOString(): string {
    return this.value.toISOString().split('T')[0];
  }

  isOnOrAfter(releaseDate: ReleaseDate): boolean {
    const revisionValue = new Date(this.value);
    revisionValue.setHours(0, 0, 0, 0);
    const releaseValue = new Date(releaseDate.getValue());
    releaseValue.setHours(0, 0, 0, 0);
    return revisionValue >= releaseValue;
  }

  equals(other: RevisionDate): boolean {
    return this.toISOString() === other.toISOString();
  }

  static create(value: Date | string): RevisionDate {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidRevisionDateError('Invalid date format');
    }

    return new RevisionDate(date);
  }

  static reconstitute(value: Date | string): RevisionDate {
    return new RevisionDate(new Date(value));
  }
}

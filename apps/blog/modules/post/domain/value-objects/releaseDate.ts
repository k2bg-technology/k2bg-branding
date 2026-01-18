import { InvalidReleaseDateError } from '../errors/errors';

/**
 * ReleaseDate Value Object
 *
 * Represents the publication date of a Post.
 * Provides methods to check if the date is in the future.
 */
export class ReleaseDate {
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

  isFutureDate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateValue = new Date(this.value);
    dateValue.setHours(0, 0, 0, 0);
    return dateValue > today;
  }

  equals(other: ReleaseDate): boolean {
    return this.toISOString() === other.toISOString();
  }

  static create(value: Date | string): ReleaseDate {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidReleaseDateError('Invalid date format');
    }

    return new ReleaseDate(date);
  }

  static reconstitute(value: Date | string): ReleaseDate {
    return new ReleaseDate(new Date(value));
  }
}

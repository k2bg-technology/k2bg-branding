import { InvalidNameError } from '../errors/errors';

/**
 * Name Value Object
 *
 * Represents the display name of an affiliate.
 * Max 200 characters, non-empty, trimmed.
 */
export class Name {
  private static readonly MAX_LENGTH = 200;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Name): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Name {
    if (!value || value.trim() === '') {
      throw new InvalidNameError('Name cannot be empty');
    }
    const trimmed = value.trim();
    if (trimmed.length > Name.MAX_LENGTH) {
      throw new InvalidNameError(
        `Name cannot exceed ${Name.MAX_LENGTH} characters`
      );
    }
    return new Name(trimmed);
  }

  static reconstitute(value: string): Name {
    return new Name(value);
  }
}

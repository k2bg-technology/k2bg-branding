import { InvalidNameError } from '../errors/errors';

/**
 * Name Value Object
 *
 * Represents a contact name.
 * Validates that the name is not empty and does not exceed maximum length.
 */
export class Name {
  private static readonly MAX_LENGTH = 100;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  getLength(): number {
    return this.value.length;
  }

  equals(other: Name): boolean {
    return this.value === other.value;
  }

  static create(value: string): Name {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidNameError('Name cannot be empty');
    }

    if (trimmed.length > Name.MAX_LENGTH) {
      throw new InvalidNameError(
        `Name must be ${Name.MAX_LENGTH} characters or less`
      );
    }

    return new Name(trimmed);
  }

  static reconstitute(value: string): Name {
    return new Name(value);
  }
}

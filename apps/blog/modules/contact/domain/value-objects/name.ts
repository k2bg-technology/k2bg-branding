import { InvalidNameError } from '../errors/errors';

export class Name {
  private static readonly MAX_LENGTH = 100;

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
        `Name must be ${Name.MAX_LENGTH} characters or less`
      );
    }
    return new Name(trimmed);
  }

  static reconstitute(value: string): Name {
    return new Name(value);
  }
}

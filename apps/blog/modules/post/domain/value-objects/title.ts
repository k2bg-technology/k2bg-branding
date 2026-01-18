import { InvalidTitleError } from '../errors/errors';

/**
 * Title Value Object
 *
 * Represents the title of a Post.
 * Validates that the title is not empty and does not exceed 100 characters.
 */
export class Title {
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

  equals(other: Title): boolean {
    return this.value === other.value;
  }

  static create(value: string): Title {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidTitleError('Title cannot be empty');
    }

    if (trimmed.length > Title.MAX_LENGTH) {
      throw new InvalidTitleError(
        `Title must be ${Title.MAX_LENGTH} characters or less`
      );
    }

    return new Title(trimmed);
  }

  static reconstitute(value: string): Title {
    return new Title(value);
  }
}

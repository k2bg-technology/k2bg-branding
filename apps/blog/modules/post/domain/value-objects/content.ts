import { InvalidContentError } from '../errors/errors';

/**
 * Content Value Object
 *
 * Represents the body content of a Post.
 * Validates that the content is not empty and does not exceed 100,000 characters.
 */
export class Content {
  private static readonly MAX_LENGTH = 100_000;

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

  isEmpty(): boolean {
    return this.value.trim().length === 0;
  }

  equals(other: Content): boolean {
    return this.value === other.value;
  }

  static create(value: string): Content {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidContentError('Content cannot be empty');
    }

    if (trimmed.length > Content.MAX_LENGTH) {
      throw new InvalidContentError(
        `Content must be ${Content.MAX_LENGTH.toLocaleString()} characters or less`
      );
    }

    return new Content(trimmed);
  }

  static reconstitute(value: string): Content {
    return new Content(value);
  }
}

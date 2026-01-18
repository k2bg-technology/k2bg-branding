import { InvalidExcerptError } from '../errors/errors';

/**
 * Excerpt Value Object
 *
 * Represents an optional summary/excerpt of a Post.
 * Validates that the excerpt does not exceed 500 characters.
 */
export class Excerpt {
  private static readonly MAX_LENGTH = 500;

  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  getValue(): string | null {
    return this.value;
  }

  hasValue(): boolean {
    return this.value !== null;
  }

  getLength(): number {
    return this.value?.length ?? 0;
  }

  equals(other: Excerpt): boolean {
    return this.value === other.value;
  }

  static create(value: string | null | undefined): Excerpt {
    if (value === null || value === undefined) {
      return new Excerpt(null);
    }

    const trimmed = value.trim();

    if (trimmed === '') {
      return new Excerpt(null);
    }

    if (trimmed.length > Excerpt.MAX_LENGTH) {
      throw new InvalidExcerptError(
        `Excerpt must be ${Excerpt.MAX_LENGTH} characters or less`
      );
    }

    return new Excerpt(trimmed);
  }

  static empty(): Excerpt {
    return new Excerpt(null);
  }

  static reconstitute(value: string | null): Excerpt {
    return new Excerpt(value);
  }
}

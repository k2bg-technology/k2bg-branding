import { InvalidSlugError } from '../errors/errors';

/**
 * Slug Value Object
 *
 * Represents the URL-friendly identifier of a Post.
 * Contains only the human-readable kebab-case slug text.
 *
 * Pattern: lowercase letters, numbers, and hyphens (kebab-case)
 */
export class Slug {
  private static readonly PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  private static readonly MAX_LENGTH = 100;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  static create(value: string): Slug {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidSlugError('Slug cannot be empty');
    }

    if (trimmed.length > Slug.MAX_LENGTH) {
      throw new InvalidSlugError(
        `Slug cannot exceed ${Slug.MAX_LENGTH} characters`
      );
    }

    if (!Slug.PATTERN.test(trimmed)) {
      throw new InvalidSlugError(
        `Slug must be kebab-case (lowercase letters, numbers, and hyphens). Got: ${trimmed}`
      );
    }

    return new Slug(trimmed);
  }

  static reconstitute(value: string): Slug {
    return new Slug(value);
  }
}

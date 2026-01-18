import { InvalidAuthorIdError } from '../errors/errors';

/**
 * AuthorId Value Object
 *
 * Represents a unique identifier for an Author.
 * Validates UUID v4 format.
 */
export class AuthorId {
  private static readonly UUID_V4_PATTERN =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AuthorId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): AuthorId {
    if (!value || value.trim() === '') {
      throw new InvalidAuthorIdError('AuthorId cannot be empty');
    }
    if (!AuthorId.UUID_V4_PATTERN.test(value)) {
      throw new InvalidAuthorIdError(`Invalid UUID v4 format: ${value}`);
    }
    return new AuthorId(value.toLowerCase());
  }

  static reconstitute(value: string): AuthorId {
    return new AuthorId(value);
  }
}

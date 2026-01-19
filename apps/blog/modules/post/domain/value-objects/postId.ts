import { InvalidPostIdError } from '../errors/errors';

/**
 * PostId Value Object
 *
 * Represents a unique identifier for a Post entity.
 * Validates UUID v4/v7/v8 format.
 */
export class PostId {
  private static readonly UUID_PATTERN =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[478][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PostId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): PostId {
    if (!value || value.trim() === '') {
      throw new InvalidPostIdError('PostId cannot be empty');
    }
    if (!PostId.UUID_PATTERN.test(value)) {
      throw new InvalidPostIdError(`Invalid UUID format: ${value}`);
    }
    return new PostId(value.toLowerCase());
  }

  static generate(): PostId {
    return new PostId(crypto.randomUUID());
  }

  static reconstitute(value: string): PostId {
    return new PostId(value);
  }
}

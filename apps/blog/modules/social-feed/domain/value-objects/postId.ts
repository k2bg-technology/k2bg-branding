import { InvalidPostIdError } from '../errors/errors';

/**
 * PostId Value Object
 *
 * Represents the unique identifier of a social post.
 * Immutable and compared by value equality.
 */
export class PostId {
  private constructor(private readonly value: string) {}

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
    return new PostId(value.trim());
  }
}

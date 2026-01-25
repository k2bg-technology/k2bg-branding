import { InvalidMediaIdError } from '../errors/errors';

/**
 * MediaId Value Object
 *
 * Represents a unique identifier for a Media entity.
 * Validates UUID v4/v7/v8 format.
 */
export class MediaId {
  private static readonly UUID_PATTERN =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[478][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MediaId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): MediaId {
    if (!value || value.trim() === '') {
      throw new InvalidMediaIdError('MediaId cannot be empty');
    }
    if (!MediaId.UUID_PATTERN.test(value)) {
      throw new InvalidMediaIdError(`Invalid UUID format: ${value}`);
    }
    return new MediaId(value.toLowerCase());
  }

  static generate(): MediaId {
    return new MediaId(crypto.randomUUID());
  }

  static reconstitute(value: string): MediaId {
    return new MediaId(value);
  }
}

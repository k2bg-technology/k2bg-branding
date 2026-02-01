import { InvalidMediaUrlError } from '../errors/errors';

/**
 * MediaUrl Value Object
 *
 * Represents the URL of a media file in a social post.
 * Immutable and compared by value equality.
 */
export class MediaUrl {
  private constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }

  equals(other: MediaUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): MediaUrl {
    if (!value || value.trim() === '') {
      throw new InvalidMediaUrlError('MediaUrl cannot be empty');
    }

    const trimmed = value.trim();

    try {
      new URL(trimmed);
    } catch {
      throw new InvalidMediaUrlError('MediaUrl must be a valid URL');
    }

    return new MediaUrl(trimmed);
  }
}

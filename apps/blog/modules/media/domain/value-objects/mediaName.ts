import { InvalidMediaNameError } from '../errors/errors';

/**
 * MediaName Value Object
 *
 * Represents the display name of a media item.
 * Max 200 characters, non-empty, trimmed.
 */
export class MediaName {
  private static readonly MAX_LENGTH = 200;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MediaName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): MediaName {
    if (!value || value.trim() === '') {
      throw new InvalidMediaNameError('MediaName cannot be empty');
    }
    const trimmed = value.trim();
    if (trimmed.length > MediaName.MAX_LENGTH) {
      throw new InvalidMediaNameError(
        `MediaName cannot exceed ${MediaName.MAX_LENGTH} characters`
      );
    }
    return new MediaName(trimmed);
  }

  static reconstitute(value: string): MediaName {
    return new MediaName(value);
  }
}

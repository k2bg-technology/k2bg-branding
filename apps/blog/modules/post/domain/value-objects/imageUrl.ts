import { InvalidImageUrlError } from '../errors/errors';

/**
 * ImageUrl Value Object
 *
 * Represents the featured image URL of a Post.
 * Validates that the URL starts with https:// and does not exceed 2,000 characters.
 */
export class ImageUrl {
  private static readonly MAX_LENGTH = 2_000;
  private static readonly HTTPS_PREFIX = 'https://';

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ImageUrl): boolean {
    return this.value === other.value;
  }

  static create(value: string): ImageUrl {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidImageUrlError('ImageUrl cannot be empty');
    }

    if (!trimmed.startsWith(ImageUrl.HTTPS_PREFIX)) {
      throw new InvalidImageUrlError('ImageUrl must start with https://');
    }

    if (trimmed.length > ImageUrl.MAX_LENGTH) {
      throw new InvalidImageUrlError(
        `ImageUrl must be ${ImageUrl.MAX_LENGTH.toLocaleString()} characters or less`
      );
    }

    try {
      new URL(trimmed);
    } catch {
      throw new InvalidImageUrlError(`Invalid URL format: ${trimmed}`);
    }

    return new ImageUrl(trimmed);
  }

  static reconstitute(value: string): ImageUrl {
    return new ImageUrl(value);
  }
}

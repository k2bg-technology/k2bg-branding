import { InvalidImageProviderError } from '../errors/errors';

/**
 * ImageProvider Value Object
 *
 * Represents the source providing the product image.
 * Max 50 characters, non-empty.
 */
export class ImageProvider {
  private static readonly MAX_LENGTH = 50;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ImageProvider): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): ImageProvider {
    if (!value || value.trim() === '') {
      throw new InvalidImageProviderError('ImageProvider cannot be empty');
    }
    const trimmed = value.trim();
    if (trimmed.length > ImageProvider.MAX_LENGTH) {
      throw new InvalidImageProviderError(
        `ImageProvider cannot exceed ${ImageProvider.MAX_LENGTH} characters`
      );
    }
    return new ImageProvider(trimmed);
  }

  static reconstitute(value: string): ImageProvider {
    return new ImageProvider(value);
  }
}

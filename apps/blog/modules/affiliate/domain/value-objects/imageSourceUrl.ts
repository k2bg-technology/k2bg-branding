import { InvalidImageSourceUrlError } from '../errors/errors';

/**
 * ImageSourceUrl Value Object
 *
 * Represents the URL of an affiliate image.
 * Must be a valid URL format.
 */
export class ImageSourceUrl {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ImageSourceUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): ImageSourceUrl {
    if (!value || value.trim() === '') {
      throw new InvalidImageSourceUrlError('ImageSourceUrl cannot be empty');
    }
    try {
      new URL(value);
    } catch {
      throw new InvalidImageSourceUrlError(`Invalid URL format: ${value}`);
    }
    return new ImageSourceUrl(value);
  }

  static reconstitute(value: string): ImageSourceUrl {
    return new ImageSourceUrl(value);
  }
}

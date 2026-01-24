import { InvalidImageWidthError } from '../errors/errors';

/**
 * ImageWidth Value Object
 *
 * Represents the width of an affiliate image in pixels.
 * Must be a positive integer.
 */
export class ImageWidth {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: ImageWidth): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  static create(value: number): ImageWidth {
    if (!Number.isInteger(value)) {
      throw new InvalidImageWidthError('ImageWidth must be an integer');
    }
    if (value <= 0) {
      throw new InvalidImageWidthError('ImageWidth must be a positive number');
    }
    return new ImageWidth(value);
  }

  static reconstitute(value: number): ImageWidth {
    return new ImageWidth(value);
  }
}

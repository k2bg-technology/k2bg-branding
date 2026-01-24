import { InvalidImageHeightError } from '../errors/errors';

/**
 * ImageHeight Value Object
 *
 * Represents the height of an affiliate image in pixels.
 * Must be a positive integer.
 */
export class ImageHeight {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: ImageHeight): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  static create(value: number): ImageHeight {
    if (!Number.isInteger(value)) {
      throw new InvalidImageHeightError('ImageHeight must be an integer');
    }
    if (value <= 0) {
      throw new InvalidImageHeightError(
        'ImageHeight must be a positive number'
      );
    }
    return new ImageHeight(value);
  }

  static reconstitute(value: number): ImageHeight {
    return new ImageHeight(value);
  }
}

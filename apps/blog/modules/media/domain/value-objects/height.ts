import { InvalidHeightError } from '../errors/errors';

/**
 * Height Value Object
 *
 * Represents the height of a media item in pixels.
 * Must be a positive integer.
 */
export class Height {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Height): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  static create(value: number): Height {
    if (!Number.isInteger(value)) {
      throw new InvalidHeightError('Height must be an integer');
    }
    if (value <= 0) {
      throw new InvalidHeightError('Height must be a positive number');
    }
    return new Height(value);
  }

  static reconstitute(value: number): Height {
    return new Height(value);
  }
}

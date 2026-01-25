import { InvalidWidthError } from '../errors/errors';

/**
 * Width Value Object
 *
 * Represents the width of a media item in pixels.
 * Must be a positive integer.
 */
export class Width {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Width): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  static create(value: number): Width {
    if (!Number.isInteger(value)) {
      throw new InvalidWidthError('Width must be an integer');
    }
    if (value <= 0) {
      throw new InvalidWidthError('Width must be a positive number');
    }
    return new Width(value);
  }

  static reconstitute(value: number): Width {
    return new Width(value);
  }
}

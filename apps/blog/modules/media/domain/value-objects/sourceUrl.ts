import { InvalidSourceUrlError } from '../errors/errors';

/**
 * SourceUrl Value Object
 *
 * Represents the external URL of a media item.
 * Must be a valid URL format.
 */
export class SourceUrl {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SourceUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): SourceUrl {
    if (!value || value.trim() === '') {
      throw new InvalidSourceUrlError('SourceUrl cannot be empty');
    }
    try {
      new URL(value);
    } catch {
      throw new InvalidSourceUrlError(`Invalid URL format: ${value}`);
    }
    return new SourceUrl(value);
  }

  static reconstitute(value: string): SourceUrl {
    return new SourceUrl(value);
  }
}

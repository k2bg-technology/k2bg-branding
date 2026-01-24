import { InvalidTargetUrlError } from '../errors/errors';

/**
 * TargetUrl Value Object
 *
 * Represents the destination URL for an affiliate link.
 * Must be a valid URL format.
 */
export class TargetUrl {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TargetUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): TargetUrl {
    if (!value || value.trim() === '') {
      throw new InvalidTargetUrlError('TargetUrl cannot be empty');
    }
    try {
      new URL(value);
    } catch {
      throw new InvalidTargetUrlError(`Invalid URL format: ${value}`);
    }
    return new TargetUrl(value);
  }

  static reconstitute(value: string): TargetUrl {
    return new TargetUrl(value);
  }
}

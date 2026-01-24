import { InvalidProviderError } from '../errors/errors';

/**
 * Provider Value Object
 *
 * Represents the affiliate service provider (e.g., Amazon, Rakuten).
 * Max 50 characters, non-empty.
 */
export class Provider {
  private static readonly MAX_LENGTH = 50;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Provider): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Provider {
    if (!value || value.trim() === '') {
      throw new InvalidProviderError('Provider cannot be empty');
    }
    const trimmed = value.trim();
    if (trimmed.length > Provider.MAX_LENGTH) {
      throw new InvalidProviderError(
        `Provider cannot exceed ${Provider.MAX_LENGTH} characters`
      );
    }
    return new Provider(trimmed);
  }

  static reconstitute(value: string): Provider {
    return new Provider(value);
  }
}

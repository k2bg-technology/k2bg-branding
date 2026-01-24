import { InvalidAffiliateIdError } from '../errors/errors';

/**
 * AffiliateId Value Object
 *
 * Represents a unique identifier for an Affiliate entity.
 * Validates UUID v4/v7/v8 format.
 */
export class AffiliateId {
  private static readonly UUID_PATTERN =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[478][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AffiliateId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): AffiliateId {
    if (!value || value.trim() === '') {
      throw new InvalidAffiliateIdError('AffiliateId cannot be empty');
    }
    if (!AffiliateId.UUID_PATTERN.test(value)) {
      throw new InvalidAffiliateIdError(`Invalid UUID format: ${value}`);
    }
    return new AffiliateId(value.toLowerCase());
  }

  static generate(): AffiliateId {
    return new AffiliateId(crypto.randomUUID());
  }

  static reconstitute(value: string): AffiliateId {
    return new AffiliateId(value);
  }
}

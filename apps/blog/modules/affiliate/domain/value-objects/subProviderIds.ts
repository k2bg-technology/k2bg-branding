import { InvalidSubProviderIdsError } from '../errors/errors';

/**
 * SubProviderIds Value Object
 *
 * Represents an array of sub-provider identifiers.
 * Each ID must be a valid UUID format.
 */
export class SubProviderIds {
  private static readonly UUID_PATTERN =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[478][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

  private readonly values: readonly string[];

  private constructor(values: readonly string[]) {
    this.values = values;
  }

  getValues(): readonly string[] {
    return this.values;
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }

  count(): number {
    return this.values.length;
  }

  contains(id: string): boolean {
    return this.values.includes(id.toLowerCase());
  }

  equals(other: SubProviderIds): boolean {
    if (this.values.length !== other.values.length) {
      return false;
    }
    const sorted1 = [...this.values].sort();
    const sorted2 = [...other.values].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }

  static create(values: string[]): SubProviderIds {
    if (!Array.isArray(values)) {
      throw new InvalidSubProviderIdsError('SubProviderIds must be an array');
    }
    const invalidIds = values.filter(
      (id) => !SubProviderIds.UUID_PATTERN.test(id)
    );
    if (invalidIds.length > 0) {
      throw new InvalidSubProviderIdsError(
        `Invalid UUID format in SubProviderIds: ${invalidIds.join(', ')}`
      );
    }
    const normalized = values.map((id) => id.toLowerCase());
    const unique = Array.from(new Set(normalized));
    return new SubProviderIds(unique);
  }

  static empty(): SubProviderIds {
    return new SubProviderIds([]);
  }

  static reconstitute(values: string[]): SubProviderIds {
    return new SubProviderIds(values);
  }
}

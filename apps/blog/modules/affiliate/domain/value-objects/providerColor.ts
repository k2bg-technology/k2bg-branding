import { InvalidProviderColorError } from '../errors/errors';

/**
 * ProviderColor Value Object
 *
 * Represents the display color for a provider.
 * Must be a valid hex color format (#RGB or #RRGGBB).
 */
export class ProviderColor {
  private static readonly HEX_COLOR_PATTERN =
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProviderColor): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): ProviderColor {
    if (!value || value.trim() === '') {
      throw new InvalidProviderColorError('ProviderColor cannot be empty');
    }
    if (!ProviderColor.HEX_COLOR_PATTERN.test(value)) {
      throw new InvalidProviderColorError(
        `Invalid hex color format: ${value}. Expected #RGB or #RRGGBB`
      );
    }
    return new ProviderColor(value.toLowerCase());
  }

  static reconstitute(value: string): ProviderColor {
    return new ProviderColor(value);
  }
}

import { InvalidPermalinkError } from '../errors/errors';

export class Permalink {
  private constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }

  equals(other: Permalink): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Permalink {
    if (!value || value.trim() === '') {
      throw new InvalidPermalinkError('Permalink cannot be empty');
    }

    const trimmed = value.trim();

    try {
      new URL(trimmed);
    } catch {
      throw new InvalidPermalinkError('Permalink must be a valid URL');
    }

    return new Permalink(trimmed);
  }
}

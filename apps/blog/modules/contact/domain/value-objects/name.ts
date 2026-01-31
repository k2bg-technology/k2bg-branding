import { InvalidNameError } from '../errors/errors';

export class Name {
  private constructor(private readonly value: string) {}

  static create(name: string): Name {
    if (!name || name.trim().length === 0) {
      throw new InvalidNameError();
    }
    return new Name(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Name): boolean {
    return this.value === other.value;
  }
}

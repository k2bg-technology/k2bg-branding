import { InvalidEmailError } from '../errors/errors';

export class Email {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Email {
    if (!value || value.trim() === '') {
      throw new InvalidEmailError('Email cannot be empty');
    }
    const trimmed = value.trim();
    if (!Email.EMAIL_PATTERN.test(trimmed)) {
      throw new InvalidEmailError(`Invalid email format: ${trimmed}`);
    }
    return new Email(trimmed.toLowerCase());
  }

  static reconstitute(value: string): Email {
    return new Email(value);
  }
}

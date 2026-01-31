import { InvalidEmailError } from '../errors/errors';

/**
 * Email Value Object
 *
 * Represents an email address.
 * Validates that the email follows a valid format.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  static create(value: string): Email {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidEmailError('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailError('Invalid email format');
    }

    return new Email(trimmed.toLowerCase());
  }

  static reconstitute(value: string): Email {
    return new Email(value);
  }
}

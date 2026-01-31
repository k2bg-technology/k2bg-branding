import { InvalidEmailError } from '../errors/errors';

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!email || !Email.isValid(email)) {
      throw new InvalidEmailError(email);
    }
    return new Email(email);
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

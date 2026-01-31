import { InvalidMessageError } from '../errors/errors';

export class Message {
  private static readonly MAX_LENGTH = 5000;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Message): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Message {
    if (!value || value.trim() === '') {
      throw new InvalidMessageError('Message cannot be empty');
    }
    const trimmed = value.trim();
    if (trimmed.length > Message.MAX_LENGTH) {
      throw new InvalidMessageError(
        `Message must be ${Message.MAX_LENGTH} characters or less`
      );
    }
    return new Message(trimmed);
  }

  static reconstitute(value: string): Message {
    return new Message(value);
  }
}

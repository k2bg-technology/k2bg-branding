import { InvalidMessageError } from '../errors/errors';

/**
 * Message Value Object
 *
 * Represents a contact message.
 * Validates that the message is not empty and does not exceed maximum length.
 */
export class Message {
  private static readonly MAX_LENGTH = 1000;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  getLength(): number {
    return this.value.length;
  }

  equals(other: Message): boolean {
    return this.value === other.value;
  }

  static create(value: string): Message {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new InvalidMessageError('Message cannot be empty');
    }

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

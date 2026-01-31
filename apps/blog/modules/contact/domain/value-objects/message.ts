import { InvalidMessageError } from '../errors/errors';

export class Message {
  private constructor(private readonly value: string) {}

  static create(message: string): Message {
    if (!message || message.trim().length === 0) {
      throw new InvalidMessageError();
    }
    return new Message(message.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Message): boolean {
    return this.value === other.value;
  }
}

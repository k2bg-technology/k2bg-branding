import { InvalidSourceFileError } from '../errors/errors';

/**
 * SourceFile Value Object
 *
 * Represents the uploaded file path or reference for a media item.
 * Non-empty string when provided.
 */
export class SourceFile {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SourceFile): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): SourceFile {
    if (!value || value.trim() === '') {
      throw new InvalidSourceFileError('SourceFile cannot be empty');
    }
    return new SourceFile(value.trim());
  }

  static reconstitute(value: string): SourceFile {
    return new SourceFile(value);
  }
}

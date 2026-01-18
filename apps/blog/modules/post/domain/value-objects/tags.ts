import { InvalidTagsError } from '../errors/errors';

/**
 * Tags Value Object
 *
 * Represents a collection of tags for a Post.
 * Validates maximum 20 tags, each with maximum 10 characters.
 */
export class Tags {
  private static readonly MAX_TAGS = 20;
  private static readonly MAX_TAG_LENGTH = 10;

  private readonly values: ReadonlyArray<string>;

  private constructor(values: string[]) {
    this.values = Object.freeze([...values]);
  }

  getValues(): ReadonlyArray<string> {
    return this.values;
  }

  contains(tag: string): boolean {
    return this.values.includes(tag.toLowerCase());
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }

  count(): number {
    return this.values.length;
  }

  equals(other: Tags): boolean {
    if (this.values.length !== other.values.length) {
      return false;
    }
    const sorted1 = [...this.values].sort();
    const sorted2 = [...other.values].sort();
    return sorted1.every((tag, i) => tag === sorted2[i]);
  }

  static create(values: string[]): Tags {
    const normalized = values
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0);

    const unique = Array.from(new Set(normalized));

    if (unique.length > Tags.MAX_TAGS) {
      throw new InvalidTagsError(`Maximum ${Tags.MAX_TAGS} tags allowed`);
    }

    for (const tag of unique) {
      if (tag.length > Tags.MAX_TAG_LENGTH) {
        throw new InvalidTagsError(
          `Tag "${tag}" exceeds maximum length of ${Tags.MAX_TAG_LENGTH} characters`
        );
      }
    }

    return new Tags(unique);
  }

  static empty(): Tags {
    return new Tags([]);
  }

  static reconstitute(values: string[]): Tags {
    return new Tags(values);
  }
}

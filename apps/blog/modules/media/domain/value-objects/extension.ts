import { InvalidExtensionError } from '../errors/errors';

export class Extension {
  private static readonly VALID_EXTENSIONS = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'bmp',
    'ico',
    'avif',
    'mp4',
    'webm',
    'ogg',
    'mov',
    'avi',
  ];

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Extension): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): Extension {
    if (!value || value.trim() === '') {
      throw new InvalidExtensionError('Extension cannot be empty');
    }
    const normalized = value.trim().toLowerCase().replace(/^\./, '');
    if (!Extension.VALID_EXTENSIONS.includes(normalized)) {
      throw new InvalidExtensionError(
        `Invalid extension: ${value}. Valid extensions are: ${Extension.VALID_EXTENSIONS.join(', ')}`
      );
    }
    return new Extension(normalized);
  }

  static fromUrl(url: string): Extension {
    if (!url || url.trim() === '') {
      throw new InvalidExtensionError('URL cannot be empty');
    }
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
      if (!match) {
        throw new InvalidExtensionError(
          `Cannot extract extension from URL: ${url}`
        );
      }
      return Extension.create(match[1]);
    } catch (error) {
      if (error instanceof InvalidExtensionError) {
        throw error;
      }
      throw new InvalidExtensionError(`Invalid URL format: ${url}`);
    }
  }

  static reconstitute(value: string): Extension {
    return new Extension(value);
  }
}

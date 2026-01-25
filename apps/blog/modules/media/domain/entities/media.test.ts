import { describe, expect, it } from 'vitest';

import { InvalidMediaError } from '../errors/errors';
import { MediaType } from '../types/enums';
import {
  Extension,
  Height,
  MediaId,
  MediaName,
  SourceFile,
  SourceUrl,
  TargetUrl,
  Width,
} from '../value-objects';

import { Media, type MediaProps } from './media';

function createValidMediaProps(
  overrides: Partial<MediaProps> = {}
): MediaProps {
  return {
    id: MediaId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: MediaName.create('Hero Image'),
    type: MediaType.IMAGE,
    sourceFile: null,
    sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
    targetUrl: null,
    width: null,
    height: null,
    extension: Extension.create('jpg'),
    ...overrides,
  };
}

describe('Media', () => {
  describe('create', () => {
    it('creates Media when given valid props with sourceUrl', () => {
      const props = createValidMediaProps();

      const sut = Media.create(props);

      expect(sut.id.equals(props.id)).toBe(true);
      expect(sut.name.equals(props.name)).toBe(true);
      expect(sut.type).toBe(props.type);
      expect(sut.sourceUrl?.equals(props.sourceUrl!)).toBe(true);
    });

    it('creates Media when given valid props with sourceFile', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: null,
      });

      const sut = Media.create(props);

      expect(sut.sourceFile?.equals(props.sourceFile!)).toBe(true);
      expect(sut.sourceUrl).toBeNull();
    });

    it('creates Media when given both sourceFile and sourceUrl', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
      });

      const sut = Media.create(props);

      expect(sut.sourceFile).not.toBeNull();
      expect(sut.sourceUrl).not.toBeNull();
    });

    it('creates Media with all optional fields', () => {
      const props = createValidMediaProps({
        targetUrl: TargetUrl.create('https://example.com/product'),
        width: Width.create(800),
        height: Height.create(600),
      });

      const sut = Media.create(props);

      expect(sut.targetUrl?.equals(props.targetUrl!)).toBe(true);
      expect(sut.width?.equals(props.width!)).toBe(true);
      expect(sut.height?.equals(props.height!)).toBe(true);
    });

    it('throws InvalidMediaError when neither sourceFile nor sourceUrl provided', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: null,
      });

      expect(() => Media.create(props)).toThrow(InvalidMediaError);
      expect(() => Media.create(props)).toThrow(
        'Media must have either a source file or source URL'
      );
    });
  });

  describe('reconstitute', () => {
    it('creates Media without validation', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: null,
      });

      const sut = Media.reconstitute(props);

      expect(sut.sourceFile).toBeNull();
      expect(sut.sourceUrl).toBeNull();
    });
  });

  describe('getEffectiveSource', () => {
    it('returns sourceFile value when both sourceFile and sourceUrl are present (file priority)', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
      });
      const sut = Media.create(props);

      const result = sut.getEffectiveSource();

      expect(result).toBe('/uploads/image.jpg');
    });

    it('returns sourceUrl value when only sourceUrl is present', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
      });
      const sut = Media.create(props);

      const result = sut.getEffectiveSource();

      expect(result).toBe('https://example.com/image.jpg');
    });

    it('returns sourceFile value when only sourceFile is present', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: null,
      });
      const sut = Media.create(props);

      const result = sut.getEffectiveSource();

      expect(result).toBe('/uploads/image.jpg');
    });

    it('returns null when neither source is present (reconstituted)', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: null,
      });
      const sut = Media.reconstitute(props);

      const result = sut.getEffectiveSource();

      expect(result).toBeNull();
    });
  });

  describe('hasSource', () => {
    it('returns true when sourceFile is present', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: null,
      });
      const sut = Media.create(props);

      const result = sut.hasSource();

      expect(result).toBe(true);
    });

    it('returns true when sourceUrl is present', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
      });
      const sut = Media.create(props);

      const result = sut.hasSource();

      expect(result).toBe(true);
    });

    it('returns true when both sources are present', () => {
      const props = createValidMediaProps({
        sourceFile: SourceFile.create('/uploads/image.jpg'),
        sourceUrl: SourceUrl.create('https://example.com/image.jpg'),
      });
      const sut = Media.create(props);

      const result = sut.hasSource();

      expect(result).toBe(true);
    });

    it('returns false when neither source is present (reconstituted)', () => {
      const props = createValidMediaProps({
        sourceFile: null,
        sourceUrl: null,
      });
      const sut = Media.reconstitute(props);

      const result = sut.hasSource();

      expect(result).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when comparing media with same id', () => {
      const id = MediaId.create('550e8400-e29b-41d4-a716-446655440000');
      const media1 = Media.create(createValidMediaProps({ id }));
      const media2 = Media.create(
        createValidMediaProps({
          id,
          name: MediaName.create('Different Name'),
        })
      );

      const result = media1.equals(media2);

      expect(result).toBe(true);
    });

    it('returns false when comparing media with different ids', () => {
      const media1 = Media.create(
        createValidMediaProps({
          id: MediaId.create('550e8400-e29b-41d4-a716-446655440000'),
        })
      );
      const media2 = Media.create(
        createValidMediaProps({
          id: MediaId.create('660f9500-f30c-42e5-b827-557766551111'),
        })
      );

      const result = media1.equals(media2);

      expect(result).toBe(false);
    });
  });

  describe('type property', () => {
    it('returns IMAGE type correctly', () => {
      const props = createValidMediaProps({ type: MediaType.IMAGE });

      const sut = Media.create(props);

      expect(sut.type).toBe(MediaType.IMAGE);
    });

    it('returns VIDEO type correctly', () => {
      const props = createValidMediaProps({ type: MediaType.VIDEO });

      const sut = Media.create(props);

      expect(sut.type).toBe(MediaType.VIDEO);
    });
  });
});

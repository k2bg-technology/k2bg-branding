import { describe, expect, it } from 'vitest';

import { MediaType } from '../../../../domain';
import { createNotionMediaPageResponse, MappingError } from '../../../shared';

import {
  determineMediaType,
  notionPageToImageSource,
  notionPageToMedia,
} from './mapper';

describe('mapper', () => {
  describe('determineMediaType', () => {
    it('returns IMAGE when type is MEDIA_IMAGE', () => {
      const page = createNotionMediaPageResponse({ type: 'MEDIA_IMAGE' });

      const result = determineMediaType(page);

      expect(result).toBe(MediaType.IMAGE);
    });

    it('returns VIDEO when type is MEDIA_VIDEO', () => {
      const page = createNotionMediaPageResponse({ type: 'MEDIA_VIDEO' });

      const result = determineMediaType(page);

      expect(result).toBe(MediaType.VIDEO);
    });

    it('returns null when type is unknown', () => {
      const page = createNotionMediaPageResponse();
      // Override with invalid type
      (page.properties.type as { select: { name: string } | null }).select = {
        name: 'UNKNOWN_TYPE',
      };

      const result = determineMediaType(page);

      expect(result).toBeNull();
    });

    it('returns null when type property is missing', () => {
      const page = createNotionMediaPageResponse();
      (page.properties.type as { select: { name: string } | null }).select =
        null;

      const result = determineMediaType(page);

      expect(result).toBeNull();
    });
  });

  describe('notionPageToMedia', () => {
    it('maps Notion page to Media entity with all properties', () => {
      const page = createNotionMediaPageResponse({
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'MEDIA_IMAGE',
        name: 'Test Image',
        sourceUrl: 'https://example.com/image.jpg',
        targetUrl: 'https://example.com/target',
        width: 1920,
        height: 1080,
        extension: 'jpg',
      });

      const result = notionPageToMedia(page);

      expect(result.id.getValue()).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.name.getValue()).toBe('Test Image');
      expect(result.type).toBe(MediaType.IMAGE);
      expect(result.sourceUrl?.getValue()).toBe(
        'https://example.com/image.jpg'
      );
      expect(result.targetUrl?.getValue()).toBe('https://example.com/target');
      expect(result.width?.getValue()).toBe(1920);
      expect(result.height?.getValue()).toBe(1080);
      expect(result.extension?.getValue()).toBe('jpg');
    });

    it('maps VIDEO type correctly', () => {
      const page = createNotionMediaPageResponse({ type: 'MEDIA_VIDEO' });

      const result = notionPageToMedia(page);

      expect(result.type).toBe(MediaType.VIDEO);
    });

    it('uses sourceFile when both sourceFile and sourceUrl are provided', () => {
      const page = createNotionMediaPageResponse({
        sourceFile: 'https://s3.example.com/uploaded.jpg',
        sourceUrl: 'https://example.com/external.jpg',
      });

      const result = notionPageToMedia(page);

      expect(result.sourceFile?.getValue()).toBe(
        'https://s3.example.com/uploaded.jpg'
      );
      expect(result.sourceUrl?.getValue()).toBe(
        'https://example.com/external.jpg'
      );
    });

    it('uses sourceUrl when sourceFile is not provided', () => {
      const page = createNotionMediaPageResponse({
        sourceUrl: 'https://example.com/external.jpg',
      });

      const result = notionPageToMedia(page);

      expect(result.sourceFile).toBeNull();
      expect(result.sourceUrl?.getValue()).toBe(
        'https://example.com/external.jpg'
      );
    });

    it('handles null optional properties', () => {
      const page = createNotionMediaPageResponse({
        sourceUrl: 'https://example.com/media.jpg',
      });
      // Clear optional properties
      (page.properties.targetUrl as { url: string | null }).url = null;
      (page.properties.width as { number: number | null }).number = null;
      (page.properties.height as { number: number | null }).number = null;
      (page.properties.extension as { rich_text: unknown[] }).rich_text = [];

      const result = notionPageToMedia(page);

      expect(result.targetUrl).toBeNull();
      expect(result.width).toBeNull();
      expect(result.height).toBeNull();
      expect(result.extension).toBeNull();
    });

    it('uses "Untitled" when name is missing', () => {
      const page = createNotionMediaPageResponse();
      (page.properties.name as { title: unknown[] }).title = [];

      const result = notionPageToMedia(page);

      expect(result.name.getValue()).toBe('Untitled');
    });

    it('throws MappingError when media type is unknown', () => {
      const page = createNotionMediaPageResponse();
      (page.properties.type as { select: { name: string } | null }).select = {
        name: 'INVALID_TYPE',
      };

      expect(() => notionPageToMedia(page)).toThrow(MappingError);
      expect(() => notionPageToMedia(page)).toThrow(
        'Unknown media type for page'
      );
    });

    it('throws MappingError when neither sourceFile nor sourceUrl exists', () => {
      const page = createNotionMediaPageResponse();
      (page.properties.sourceFile as { files: unknown[] }).files = [];
      (page.properties.sourceUrl as { url: string | null }).url = null;

      expect(() => notionPageToMedia(page)).toThrow(MappingError);
      expect(() => notionPageToMedia(page)).toThrow(
        'Media must have either sourceFile or sourceUrl'
      );
    });
  });

  describe('notionPageToImageSource', () => {
    it('returns ImageSource for IMAGE type', () => {
      const page = createNotionMediaPageResponse({
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'MEDIA_IMAGE',
        sourceUrl: 'https://example.com/image.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result?.url.getValue()).toBe('https://example.com/image.jpg');
    });

    it('returns null for VIDEO type', () => {
      const page = createNotionMediaPageResponse({ type: 'MEDIA_VIDEO' });

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('returns null when media type is unknown', () => {
      const page = createNotionMediaPageResponse();
      (page.properties.type as { select: { name: string } | null }).select = {
        name: 'UNKNOWN_TYPE',
      };

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('prioritizes sourceFile over sourceUrl (business rule)', () => {
      const page = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        sourceFile: 'https://s3.example.com/uploaded.jpg',
        sourceUrl: 'https://example.com/external.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result?.url.getValue()).toBe(
        'https://s3.example.com/uploaded.jpg'
      );
    });

    it('falls back to sourceUrl when sourceFile is not provided', () => {
      const page = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        sourceUrl: 'https://example.com/external.jpg',
      });

      const result = notionPageToImageSource(page);

      expect(result?.url.getValue()).toBe('https://example.com/external.jpg');
    });

    it('returns null when no source exists', () => {
      const page = createNotionMediaPageResponse({ type: 'MEDIA_IMAGE' });
      (page.properties.sourceFile as { files: unknown[] }).files = [];
      (page.properties.sourceUrl as { url: string | null }).url = null;

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });
  });
});

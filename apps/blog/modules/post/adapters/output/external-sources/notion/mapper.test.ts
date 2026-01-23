import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { describe, expect, it } from 'vitest';
import { Category, EmbedType, PostStatus, PostType } from '../../../../domain';
import { createNotionPageResponse } from '../../../shared';
import {
  getEmbedTypeFromPage,
  mapEmbedType,
  notionPageToImageSource,
  notionPageToPost,
} from './mapper';

describe('notion/mapper', () => {
  describe('notionPageToPost', () => {
    it('maps Notion Page to Domain Post correctly', () => {
      const page = createNotionPageResponse() as unknown as PageObjectResponse;
      const content = 'This is the markdown content.';

      const result = notionPageToPost(page, content);

      expect(result.id.getValue()).toBe(page.id);
      expect(result.title.getValue()).toBe('Test Post Title');
      expect(result.content.getValue()).toBe(content);
      expect(result.type).toBe(PostType.ARTICLE);
      expect(result.excerpt.getValue()).toBe('Test excerpt');
      expect(result.status).toBe(PostStatus.PUBLISHED);
      expect(result.category).toBe(Category.ENGINEERING);
    });

    it('uses slug property when available', () => {
      const page = createNotionPageResponse() as unknown as PageObjectResponse;

      const result = notionPageToPost(page, 'content');

      expect(result.slug.getValue()).toBe('test-post');
    });

    it('uses kebab-cased page id as slug when slug property is empty', () => {
      const page = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          slug: {
            type: 'rich_text',
            rich_text: [],
          },
        },
      }) as unknown as PageObjectResponse;

      const result = notionPageToPost(page, 'content');

      // UUID is already valid kebab-case format
      expect(result.slug.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('maps tags from multi_select property', () => {
      const page = createNotionPageResponse() as unknown as PageObjectResponse;

      const result = notionPageToPost(page, 'content');

      expect(result.tags.getValues()).toEqual(['typescript', 'testing']);
    });

    it('handles missing optional properties with defaults', () => {
      const page = createNotionPageResponse({
        properties: {
          content: {
            type: 'title',
            title: [{ plain_text: 'Test' }],
          },
          type: { type: 'select', select: null },
          status: { type: 'status', status: null },
          category: { type: 'select', select: null },
          excerpt: { type: 'rich_text', rich_text: [] },
          slug: { type: 'rich_text', rich_text: [] },
          imageUrl: { type: 'files', files: [] },
          releaseDate: { type: 'date', date: null },
          revisionDate: { type: 'date', date: null },
          author: { type: 'people', people: [] },
          tags: { type: 'multi_select', multi_select: [] },
        },
      }) as unknown as PageObjectResponse;

      const result = notionPageToPost(page, 'content');

      expect(result.type).toBe(PostType.ARTICLE);
      expect(result.status).toBe(PostStatus.DRAFT);
      expect(result.category).toBe(Category.OTHER);
      expect(result.excerpt.getValue()).toBeNull();
      expect(result.authorId.getValue()).toBe(
        '00000000-0000-4000-a000-000000000000'
      );
      expect(result.tags.getValues()).toEqual([]);
    });

    it('maps different post types correctly', () => {
      const articlePage = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          type: { type: 'select', select: { name: 'ARTICLE' } },
        },
      }) as unknown as PageObjectResponse;

      const pagePage = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          type: { type: 'select', select: { name: 'PAGE' } },
        },
      }) as unknown as PageObjectResponse;

      expect(notionPageToPost(articlePage, 'content').type).toBe(
        PostType.ARTICLE
      );
      expect(notionPageToPost(pagePage, 'content').type).toBe(PostType.PAGE);
    });

    it('maps different statuses correctly', () => {
      const statuses = [
        { input: 'IDEA', expected: PostStatus.IDEA },
        { input: 'DRAFT', expected: PostStatus.DRAFT },
        { input: 'PREVIEW', expected: PostStatus.PREVIEW },
        { input: 'PUBLISHED', expected: PostStatus.PUBLISHED },
        { input: 'ARCHIVED', expected: PostStatus.ARCHIVED },
      ];

      for (const { input, expected } of statuses) {
        const page = createNotionPageResponse({
          properties: {
            ...(createNotionPageResponse().properties as Record<
              string,
              unknown
            >),
            status: { type: 'status', status: { name: input } },
          },
        }) as unknown as PageObjectResponse;

        expect(notionPageToPost(page, 'content').status).toBe(expected);
      }
    });

    it('maps different categories correctly', () => {
      const categories = [
        { input: 'ENGINEERING', expected: Category.ENGINEERING },
        { input: 'DESIGN', expected: Category.DESIGN },
        { input: 'DATA_SCIENCE', expected: Category.DATA_SCIENCE },
        { input: 'LIFE_STYLE', expected: Category.LIFE_STYLE },
        { input: 'OTHER', expected: Category.OTHER },
      ];

      for (const { input, expected } of categories) {
        const page = createNotionPageResponse({
          properties: {
            ...(createNotionPageResponse().properties as Record<
              string,
              unknown
            >),
            category: { type: 'select', select: { name: input } },
          },
        }) as unknown as PageObjectResponse;

        expect(notionPageToPost(page, 'content').category).toBe(expected);
      }
    });
  });

  describe('notionPageToImageSource', () => {
    it('returns ImageSourceRecord when image URL exists', () => {
      const page = createNotionPageResponse() as unknown as PageObjectResponse;

      const result = notionPageToImageSource(page);

      expect(result).toEqual({
        id: page.id,
        url: 'https://example.com/image.jpg',
      });
    });

    it('returns null when no image URL exists', () => {
      const page = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          imageUrl: { type: 'files', files: [] },
        },
      }) as unknown as PageObjectResponse;

      const result = notionPageToImageSource(page);

      expect(result).toBeNull();
    });

    it('handles file type URLs', () => {
      const page = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          imageUrl: {
            type: 'files',
            files: [
              {
                type: 'file',
                file: { url: 'https://s3.amazonaws.com/image.jpg' },
              },
            ],
          },
        },
      }) as unknown as PageObjectResponse;

      const result = notionPageToImageSource(page);

      expect(result).toEqual({
        id: page.id,
        url: 'https://s3.amazonaws.com/image.jpg',
      });
    });
  });

  describe('getEmbedTypeFromPage', () => {
    it('returns type string when page has type select property', () => {
      const page = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          type: { type: 'select', select: { name: 'MEDIA_IMAGE' } },
        },
      }) as unknown as PageObjectResponse;

      const result = getEmbedTypeFromPage(page);

      expect(result).toBe('MEDIA_IMAGE');
    });

    it('returns null when type select is null', () => {
      const page = createNotionPageResponse({
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          type: { type: 'select', select: null },
        },
      }) as unknown as PageObjectResponse;

      const result = getEmbedTypeFromPage(page);

      expect(result).toBeNull();
    });
  });

  describe('mapEmbedType', () => {
    it.each([
      { input: 'AFFILIATE_PRODUCT', expected: EmbedType.AFFILIATE_PRODUCT },
      { input: 'AFFILIATE_BANNER', expected: EmbedType.AFFILIATE_BANNER },
      { input: 'AFFILIATE_TEXT', expected: EmbedType.AFFILIATE_TEXT },
      { input: 'MEDIA_IMAGE', expected: EmbedType.MEDIA_IMAGE },
      { input: 'MEDIA_VIDEO', expected: EmbedType.MEDIA_VIDEO },
      { input: 'MEDIA_AUDIO', expected: EmbedType.MEDIA_AUDIO },
    ])('returns $expected when input is $input', ({ input, expected }) => {
      const result = mapEmbedType(input);

      expect(result).toBe(expected);
    });

    it('returns null when input is unknown type', () => {
      const result = mapEmbedType('UNKNOWN_TYPE');

      expect(result).toBeNull();
    });

    it('handles case-insensitive input', () => {
      const result = mapEmbedType('media_image');

      expect(result).toBe(EmbedType.MEDIA_IMAGE);
    });
  });
});

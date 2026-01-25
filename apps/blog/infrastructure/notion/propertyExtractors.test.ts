import { describe, expect, it } from 'vitest';

import {
  getAllFileUrls,
  getDate,
  getFirstFileUrl,
  getMultiSelect,
  getNumber,
  getPerson,
  getRelations,
  getRichText,
  getSelect,
  getStatus,
  getTitle,
  getUrl,
  type NotionProperties,
} from './propertyExtractors';

function createProperty(type: string, data: Record<string, unknown>) {
  return { type, ...data };
}

describe('infrastructure/notion/property-extractors', () => {
  describe('getTitle', () => {
    it('extracts text from title property', () => {
      const props = {
        name: createProperty('title', {
          title: [{ plain_text: 'Hello ' }, { plain_text: 'World' }],
        }),
      } as unknown as NotionProperties;

      expect(getTitle(props, 'name')).toBe('Hello World');
    });

    it('returns null for empty title', () => {
      const props = {
        name: createProperty('title', { title: [] }),
      } as unknown as NotionProperties;

      expect(getTitle(props, 'name')).toBeNull();
    });

    it('returns null for non-title property type', () => {
      const props = {
        name: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getTitle(props, 'name')).toBeNull();
    });

    it('returns null for missing property', () => {
      const props = {} as NotionProperties;

      expect(getTitle(props, 'missing')).toBeNull();
    });
  });

  describe('getRichText', () => {
    it('extracts text from rich_text property', () => {
      const props = {
        excerpt: createProperty('rich_text', {
          rich_text: [{ plain_text: 'First ' }, { plain_text: 'Second' }],
        }),
      } as unknown as NotionProperties;

      expect(getRichText(props, 'excerpt')).toBe('First Second');
    });

    it('returns null for empty rich_text', () => {
      const props = {
        excerpt: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getRichText(props, 'excerpt')).toBeNull();
    });

    it('returns null for non-rich_text property type', () => {
      const props = {
        excerpt: createProperty('title', { title: [] }),
      } as unknown as NotionProperties;

      expect(getRichText(props, 'excerpt')).toBeNull();
    });
  });

  describe('getUrl', () => {
    it('extracts URL from url property', () => {
      const props = {
        link: createProperty('url', { url: 'https://example.com' }),
      } as unknown as NotionProperties;

      expect(getUrl(props, 'link')).toBe('https://example.com');
    });

    it('returns null for null URL', () => {
      const props = {
        link: createProperty('url', { url: null }),
      } as unknown as NotionProperties;

      expect(getUrl(props, 'link')).toBeNull();
    });

    it('returns null for non-url property type', () => {
      const props = {
        link: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getUrl(props, 'link')).toBeNull();
    });
  });

  describe('getSelect', () => {
    it('extracts name from select property', () => {
      const props = {
        type: createProperty('select', { select: { name: 'Option A' } }),
      } as unknown as NotionProperties;

      expect(getSelect(props, 'type')).toBe('Option A');
    });

    it('returns null for null select', () => {
      const props = {
        type: createProperty('select', { select: null }),
      } as unknown as NotionProperties;

      expect(getSelect(props, 'type')).toBeNull();
    });

    it('returns null for non-select property type', () => {
      const props = {
        type: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getSelect(props, 'type')).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('extracts name from status property', () => {
      const props = {
        status: createProperty('status', { status: { name: 'In Progress' } }),
      } as unknown as NotionProperties;

      expect(getStatus(props, 'status')).toBe('In Progress');
    });

    it('returns null for null status', () => {
      const props = {
        status: createProperty('status', { status: null }),
      } as unknown as NotionProperties;

      expect(getStatus(props, 'status')).toBeNull();
    });

    it('returns null for non-status property type', () => {
      const props = {
        status: createProperty('select', { select: null }),
      } as unknown as NotionProperties;

      expect(getStatus(props, 'status')).toBeNull();
    });
  });

  describe('getNumber', () => {
    it('extracts number from number property', () => {
      const props = {
        count: createProperty('number', { number: 42 }),
      } as unknown as NotionProperties;

      expect(getNumber(props, 'count')).toBe(42);
    });

    it('returns null for null number', () => {
      const props = {
        count: createProperty('number', { number: null }),
      } as unknown as NotionProperties;

      expect(getNumber(props, 'count')).toBeNull();
    });

    it('handles zero value', () => {
      const props = {
        count: createProperty('number', { number: 0 }),
      } as unknown as NotionProperties;

      expect(getNumber(props, 'count')).toBe(0);
    });

    it('returns null for non-number property type', () => {
      const props = {
        count: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getNumber(props, 'count')).toBeNull();
    });
  });

  describe('getDate', () => {
    it('extracts and formats date from date property', () => {
      const props = {
        releaseDate: createProperty('date', {
          date: { start: '2024-03-15T10:30:00.000Z' },
        }),
      } as unknown as NotionProperties;

      expect(getDate(props, 'releaseDate')).toBe('2024-03-15');
    });

    it('returns null for null date', () => {
      const props = {
        releaseDate: createProperty('date', { date: null }),
      } as unknown as NotionProperties;

      expect(getDate(props, 'releaseDate')).toBeNull();
    });

    it('returns null when start is missing', () => {
      const props = {
        releaseDate: createProperty('date', { date: {} }),
      } as unknown as NotionProperties;

      expect(getDate(props, 'releaseDate')).toBeNull();
    });

    it('returns null for non-date property type', () => {
      const props = {
        releaseDate: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getDate(props, 'releaseDate')).toBeNull();
    });
  });

  describe('getFirstFileUrl', () => {
    it('extracts URL from file type', () => {
      const props = {
        image: createProperty('files', {
          files: [{ type: 'file', file: { url: 'https://s3.example.com/a.jpg' } }],
        }),
      } as unknown as NotionProperties;

      expect(getFirstFileUrl(props, 'image')).toBe('https://s3.example.com/a.jpg');
    });

    it('extracts URL from external type', () => {
      const props = {
        image: createProperty('files', {
          files: [{ type: 'external', external: { url: 'https://example.com/b.jpg' } }],
        }),
      } as unknown as NotionProperties;

      expect(getFirstFileUrl(props, 'image')).toBe('https://example.com/b.jpg');
    });

    it('returns only first file when multiple exist', () => {
      const props = {
        image: createProperty('files', {
          files: [
            { type: 'file', file: { url: 'https://first.jpg' } },
            { type: 'file', file: { url: 'https://second.jpg' } },
          ],
        }),
      } as unknown as NotionProperties;

      expect(getFirstFileUrl(props, 'image')).toBe('https://first.jpg');
    });

    it('returns null for empty files array', () => {
      const props = {
        image: createProperty('files', { files: [] }),
      } as unknown as NotionProperties;

      expect(getFirstFileUrl(props, 'image')).toBeNull();
    });

    it('returns null for non-files property type', () => {
      const props = {
        image: createProperty('url', { url: 'https://example.com' }),
      } as unknown as NotionProperties;

      expect(getFirstFileUrl(props, 'image')).toBeNull();
    });
  });

  describe('getAllFileUrls', () => {
    it('extracts all URLs from files property', () => {
      const props = {
        images: createProperty('files', {
          files: [
            { type: 'file', file: { url: 'https://s3.example.com/a.jpg' } },
            { type: 'external', external: { url: 'https://example.com/b.jpg' } },
          ],
        }),
      } as unknown as NotionProperties;

      expect(getAllFileUrls(props, 'images')).toEqual([
        'https://s3.example.com/a.jpg',
        'https://example.com/b.jpg',
      ]);
    });

    it('filters out unknown file types', () => {
      const props = {
        images: createProperty('files', {
          files: [
            { type: 'file', file: { url: 'https://valid.jpg' } },
            { type: 'unknown' },
          ],
        }),
      } as unknown as NotionProperties;

      expect(getAllFileUrls(props, 'images')).toEqual(['https://valid.jpg']);
    });

    it('returns null for empty files array', () => {
      const props = {
        images: createProperty('files', { files: [] }),
      } as unknown as NotionProperties;

      expect(getAllFileUrls(props, 'images')).toBeNull();
    });
  });

  describe('getRelations', () => {
    it('extracts IDs from relation property', () => {
      const props = {
        links: createProperty('relation', {
          relation: [{ id: 'page-1' }, { id: 'page-2' }],
        }),
      } as unknown as NotionProperties;

      expect(getRelations(props, 'links')).toEqual(['page-1', 'page-2']);
    });

    it('returns empty array for empty relations', () => {
      const props = {
        links: createProperty('relation', { relation: [] }),
      } as unknown as NotionProperties;

      expect(getRelations(props, 'links')).toEqual([]);
    });

    it('returns empty array for non-relation property type', () => {
      const props = {
        links: createProperty('url', { url: 'https://example.com' }),
      } as unknown as NotionProperties;

      expect(getRelations(props, 'links')).toEqual([]);
    });
  });

  describe('getMultiSelect', () => {
    it('extracts names from multi_select property', () => {
      const props = {
        tags: createProperty('multi_select', {
          multi_select: [{ name: 'typescript' }, { name: 'react' }],
        }),
      } as unknown as NotionProperties;

      expect(getMultiSelect(props, 'tags')).toEqual(['typescript', 'react']);
    });

    it('returns empty array for empty multi_select', () => {
      const props = {
        tags: createProperty('multi_select', { multi_select: [] }),
      } as unknown as NotionProperties;

      expect(getMultiSelect(props, 'tags')).toEqual([]);
    });

    it('returns empty array for non-multi_select property type', () => {
      const props = {
        tags: createProperty('select', { select: null }),
      } as unknown as NotionProperties;

      expect(getMultiSelect(props, 'tags')).toEqual([]);
    });
  });

  describe('getPerson', () => {
    it('extracts full person data when available', () => {
      const props = {
        author: createProperty('people', {
          people: [
            { id: 'user-1', name: 'John Doe', avatar_url: 'https://avatar.jpg' },
          ],
        }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')).toEqual({
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: 'https://avatar.jpg',
      });
    });

    it('handles partial user data', () => {
      const props = {
        author: createProperty('people', {
          people: [{ id: 'user-1' }],
        }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')).toEqual({
        id: 'user-1',
        name: undefined,
        avatarUrl: undefined,
      });
    });

    it('handles null name and avatar_url', () => {
      const props = {
        author: createProperty('people', {
          people: [{ id: 'user-1', name: null, avatar_url: null }],
        }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')).toEqual({
        id: 'user-1',
        name: undefined,
        avatarUrl: undefined,
      });
    });

    it('returns only first person when multiple exist', () => {
      const props = {
        author: createProperty('people', {
          people: [
            { id: 'user-1', name: 'First' },
            { id: 'user-2', name: 'Second' },
          ],
        }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')?.id).toBe('user-1');
    });

    it('returns null for empty people array', () => {
      const props = {
        author: createProperty('people', { people: [] }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')).toBeNull();
    });

    it('returns null for non-people property type', () => {
      const props = {
        author: createProperty('rich_text', { rich_text: [] }),
      } as unknown as NotionProperties;

      expect(getPerson(props, 'author')).toBeNull();
    });
  });
});

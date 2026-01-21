import { describe, expect, it, vi } from 'vitest';
import { createNotionPageResponse, ExternalSourceError } from '../../../shared';
import { NotionExternalPostSource } from './externalPostSource';

describe('NotionExternalPostSource', () => {
  const createMockNotionClient = () => ({
    databases: {
      query: vi.fn(),
    },
  });

  const createMockN2M = () => ({
    pageToMarkdown: vi.fn(),
    toMarkdownString: vi.fn(),
    setCustomTransformer: vi.fn(),
  });

  describe('constructor', () => {
    it('registers callout transformer that returns false', () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();

      new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      expect(mockN2M.setCustomTransformer).toHaveBeenCalledWith(
        'callout',
        expect.any(Function)
      );
      const calloutTransformer = mockN2M.setCustomTransformer.mock.calls.find(
        (call) => call[0] === 'callout'
      )?.[1];
      expect(calloutTransformer?.()).toBe(false);
    });

    it('registers link_to_page transformer that converts to embed directive', () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();

      new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      expect(mockN2M.setCustomTransformer).toHaveBeenCalledWith(
        'link_to_page',
        expect.any(Function)
      );
      const linkToPageTransformer =
        mockN2M.setCustomTransformer.mock.calls.find(
          (call) => call[0] === 'link_to_page'
        )?.[1];
      const pageId = '00000000-0000-4000-a000-000000000001';
      const block = { link_to_page: { page_id: pageId } };

      const result = linkToPageTransformer?.(block);

      expect(result).toBe(`::embed{id=${pageId}}`);
    });

    it('returns false when link_to_page block has no page_id', () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();

      new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      const linkToPageTransformer =
        mockN2M.setCustomTransformer.mock.calls.find(
          (call) => call[0] === 'link_to_page'
        )?.[1];
      const blockWithoutPageId = { link_to_page: { database_id: 'db-id' } };

      const result = linkToPageTransformer?.(blockWithoutPageId);

      expect(result).toBe(false);
    });
  });

  describe('fetchAllPosts', () => {
    it('fetches and maps posts from Notion', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      const notionPages = [
        createNotionPageResponse({
          id: '00000000-0000-4000-a000-000000000001',
        }),
        createNotionPageResponse({
          id: '00000000-0000-4000-a000-000000000002',
        }),
      ];
      mockClient.databases.query.mockResolvedValue({ results: notionPages });
      mockN2M.pageToMarkdown.mockResolvedValue([]);
      mockN2M.toMarkdownString.mockReturnValue({ parent: 'Markdown content' });

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      const result = await sut.fetchAllPosts();

      expect(result).toHaveLength(2);
      expect(mockClient.databases.query).toHaveBeenCalledWith(
        expect.objectContaining({
          database_id: 'test-database-id',
        })
      );
    });

    it('filters by PUBLISHED status', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      mockClient.databases.query.mockResolvedValue({ results: [] });

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      await sut.fetchAllPosts();

      expect(mockClient.databases.query).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            property: 'status',
            status: { equals: 'PUBLISHED' },
          },
        })
      );
    });

    it('sorts by releaseDate descending', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      mockClient.databases.query.mockResolvedValue({ results: [] });

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      await sut.fetchAllPosts();

      expect(mockClient.databases.query).toHaveBeenCalledWith(
        expect.objectContaining({
          sorts: [{ property: 'releaseDate', direction: 'descending' }],
        })
      );
    });

    it('converts pages to markdown content', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      const notionPage = createNotionPageResponse({
        id: '00000000-0000-4000-a000-000000000001',
      });
      mockClient.databases.query.mockResolvedValue({ results: [notionPage] });
      mockN2M.pageToMarkdown.mockResolvedValue([{ type: 'paragraph' }]);
      mockN2M.toMarkdownString.mockReturnValue({ parent: 'Test content' });

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      await sut.fetchAllPosts();

      expect(mockN2M.pageToMarkdown).toHaveBeenCalledWith(
        '00000000-0000-4000-a000-000000000001'
      );
      expect(mockN2M.toMarkdownString).toHaveBeenCalled();
    });

    it('returns empty array when no posts exist', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      mockClient.databases.query.mockResolvedValue({ results: [] });

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      const result = await sut.fetchAllPosts();

      expect(result).toEqual([]);
    });

    it('throws ExternalSourceError on Notion API error', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      await expect(sut.fetchAllPosts()).rejects.toThrow(ExternalSourceError);
    });

    it('includes source name in error', async () => {
      const mockClient = createMockNotionClient();
      const mockN2M = createMockN2M();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));

      const sut = new NotionExternalPostSource(
        mockClient as never,
        mockN2M as never,
        'test-database-id'
      );

      await expect(sut.fetchAllPosts()).rejects.toThrow('Notion');
    });
  });
});

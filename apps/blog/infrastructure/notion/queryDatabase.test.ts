// @vitest-environment node

import { Client } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';
import { queryDatabase } from './client';

describe('queryDatabase', () => {
  it('resolves the existing database ID and preserves filters, sorting and pagination', async () => {
    const response = {
      object: 'list',
      results: [{ object: 'page', id: 'post-id' }],
      has_more: true,
      next_cursor: 'next-page',
    };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        Response.json({
          object: 'database',
          id: 'database-id',
          data_sources: [{ id: 'source-id', name: 'Posts' }],
        })
      )
      .mockResolvedValueOnce(Response.json(response));
    const client = new Client({ auth: 'test-token', fetch });

    const result = await queryDatabase(client, {
      database_id: 'database-id',
      filter: { property: 'status', status: { equals: 'PUBLISHED' } },
      sorts: [{ property: 'releaseDate', direction: 'descending' }],
      start_cursor: 'previous-page',
      page_size: 25,
      filter_properties: ['title'],
    });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.notion.com/v1/databases/database-id',
      expect.objectContaining({ method: 'GET' })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.notion.com/v1/data_sources/source-id/query?filter_properties=title',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          sorts: [{ property: 'releaseDate', direction: 'descending' }],
          filter: { property: 'status', status: { equals: 'PUBLISHED' } },
          start_cursor: 'previous-page',
          page_size: 25,
        }),
      })
    );
  });

  it.each([
    { scenario: 'no data sources', database: { data_sources: [] } },
    {
      scenario: 'multiple data sources',
      database: { data_sources: [{ id: 'first' }, { id: 'second' }] },
    },
    {
      scenario: 'a partial database response',
      database: { object: 'database', id: 'database-id' },
    },
  ])(
    'rejects $scenario without querying an arbitrary source',
    async ({ database }) => {
      const fetch = vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(Response.json(database));
      const client = new Client({ auth: 'test-token', fetch });

      await expect(
        queryDatabase(client, { database_id: 'database-id' })
      ).rejects.toThrow(
        'Expected exactly one data source in the Notion database'
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );
});

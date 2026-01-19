import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  createNotionClient,
  createNotionToMarkdown,
  getNotionClient,
  getNotionToMarkdown,
  resetNotionClient,
} from './client';

vi.mock('@notionhq/client', () => ({
  Client: vi.fn().mockImplementation(() => ({
    databases: { query: vi.fn() },
    pages: { retrieve: vi.fn() },
  })),
}));

vi.mock('notion-to-md', () => ({
  NotionToMarkdown: vi.fn().mockImplementation(() => ({
    pageToMarkdown: vi.fn(),
    toMarkdownString: vi.fn(),
  })),
}));

describe('notion/client', () => {
  beforeEach(() => {
    resetNotionClient();
  });

  afterEach(() => {
    resetNotionClient();
  });

  describe('createNotionClient', () => {
    it('creates a new Notion client instance', () => {
      const client = createNotionClient();

      expect(client).toBeDefined();
    });

    it('creates different instances on each call', () => {
      const client1 = createNotionClient();
      const client2 = createNotionClient();

      expect(client1).not.toBe(client2);
    });

    it('accepts custom auth token', () => {
      const client = createNotionClient({ auth: 'custom-token' });

      expect(client).toBeDefined();
    });
  });

  describe('getNotionClient', () => {
    it('returns a Notion client instance', () => {
      const client = getNotionClient();

      expect(client).toBeDefined();
    });

    it('returns the same instance on multiple calls', () => {
      const client1 = getNotionClient();
      const client2 = getNotionClient();

      expect(client1).toBe(client2);
    });
  });

  describe('createNotionToMarkdown', () => {
    it('creates a NotionToMarkdown instance', () => {
      const client = createNotionClient();
      const n2m = createNotionToMarkdown(client);

      expect(n2m).toBeDefined();
    });
  });

  describe('getNotionToMarkdown', () => {
    it('returns a NotionToMarkdown instance', () => {
      const n2m = getNotionToMarkdown();

      expect(n2m).toBeDefined();
    });

    it('returns the same instance on multiple calls', () => {
      const n2m1 = getNotionToMarkdown();
      const n2m2 = getNotionToMarkdown();

      expect(n2m1).toBe(n2m2);
    });
  });

  describe('resetNotionClient', () => {
    it('resets the singleton instances', () => {
      const client1 = getNotionClient();
      const n2m1 = getNotionToMarkdown();

      resetNotionClient();

      const client2 = getNotionClient();
      const n2m2 = getNotionToMarkdown();

      expect(client1).not.toBe(client2);
      expect(n2m1).not.toBe(n2m2);
    });
  });
});

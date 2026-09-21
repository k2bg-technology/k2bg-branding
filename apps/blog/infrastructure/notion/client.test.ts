import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetNotionClient();
    vi.unstubAllEnvs();
  });

  describe('createNotionClient', () => {
    it.each([
      {
        scenario: 'explicit configuration overrides the environment',
        config: { auth: 'configured-token' },
        environmentToken: 'environment-token',
        expectedAuth: 'configured-token',
      },
      {
        scenario: 'the environment supplies the default token',
        config: undefined,
        environmentToken: 'environment-token',
        expectedAuth: 'environment-token',
      },
      {
        scenario: 'missing configuration and environment use an empty token',
        config: undefined,
        environmentToken: undefined,
        expectedAuth: '',
      },
      {
        scenario: 'an explicit empty token overrides the environment',
        config: { auth: '' },
        environmentToken: 'environment-token',
        expectedAuth: '',
      },
    ])(
      'forwards authentication when $scenario',
      ({ config, environmentToken, expectedAuth }) => {
        vi.stubEnv('NOTION_TOKEN', environmentToken);

        createNotionClient(config);

        expect(Client).toHaveBeenCalledWith({ auth: expectedAuth });
      }
    );

    it('creates different instances on each call', () => {
      const firstClient = createNotionClient();
      const secondClient = createNotionClient();

      expect(firstClient).not.toBe(secondClient);
    });
  });

  describe('getNotionClient', () => {
    it('returns the same instance on multiple calls', () => {
      const firstClient = getNotionClient();
      const secondClient = getNotionClient();

      expect(firstClient).toBe(secondClient);
    });
  });

  describe('createNotionToMarkdown', () => {
    it('supplies the given client to the markdown converter', () => {
      const client = createNotionClient();

      createNotionToMarkdown(client);

      expect(NotionToMarkdown).toHaveBeenCalledWith({ notionClient: client });
    });
  });

  describe('getNotionToMarkdown', () => {
    it('connects the converter to the shared Notion client', () => {
      const client = getNotionClient();

      getNotionToMarkdown();

      expect(NotionToMarkdown).toHaveBeenCalledWith({ notionClient: client });
    });

    it('returns the same instance on multiple calls', () => {
      const firstConverter = getNotionToMarkdown();
      const secondConverter = getNotionToMarkdown();

      expect(firstConverter).toBe(secondConverter);
    });
  });

  describe('resetNotionClient', () => {
    it('replaces both shared instances after a reset', () => {
      const originalClient = getNotionClient();
      const originalConverter = getNotionToMarkdown();

      resetNotionClient();

      expect(getNotionClient()).not.toBe(originalClient);
      expect(getNotionToMarkdown()).not.toBe(originalConverter);
    });
  });
});

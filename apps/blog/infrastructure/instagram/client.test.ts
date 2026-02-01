import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  configureInstagram,
  getInstagramClient,
  getInstagramUserId,
  resetInstagramConfig,
} from './client';

describe('Instagram Client', () => {
  beforeEach(() => {
    resetInstagramConfig();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
    } as Response);
  });

  afterEach(() => {
    resetInstagramConfig();
    vi.restoreAllMocks();
  });

  describe('configureInstagram', () => {
    it('uses provided config values', () => {
      const config = {
        baseUrl: 'https://custom.api.com',
        accessToken: 'custom-token',
        userId: 'custom-user-id',
      };

      configureInstagram(config);

      expect(getInstagramUserId()).toBe('custom-user-id');
    });

    it('uses environment variables when config not provided', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        INSTAGRAM_GRAPH_API_BASE_URL: 'https://env.api.com',
        INSTAGRAM_LONG_ACCESS_TOKEN: 'env-token',
        INSTAGRAM_USER_ID: 'env-user-id',
      };

      configureInstagram();

      expect(getInstagramUserId()).toBe('env-user-id');

      process.env = originalEnv;
    });
  });

  describe('getInstagramClient', () => {
    it('returns a client with fetch method', () => {
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'test-user',
      });

      const client = getInstagramClient();

      expect(client).toHaveProperty('fetch');
      expect(typeof client.fetch).toBe('function');
    });

    it('returns same instance on multiple calls', () => {
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'test-user',
      });

      const client1 = getInstagramClient();
      const client2 = getInstagramClient();

      expect(client1).toBe(client2);
    });
  });

  describe('client.fetch', () => {
    it('calls fetch with correct URL and access token', async () => {
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'test-user',
      });
      const client = getInstagramClient();

      await client.fetch('test-user/media');

      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('https://graph.instagram.com/test-user/media'),
        })
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('access_token=test-token'),
        })
      );
    });

    it('includes additional params in URL', async () => {
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'test-user',
      });
      const client = getInstagramClient();

      await client.fetch('12345', { fields: 'id,media_url' });

      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('fields=id%2Cmedia_url'),
        })
      );
    });
  });

  describe('resetInstagramConfig', () => {
    it('resets configuration and client instance', () => {
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'first-user',
      });
      const client1 = getInstagramClient();

      resetInstagramConfig();
      configureInstagram({
        baseUrl: 'https://graph.instagram.com',
        accessToken: 'test-token',
        userId: 'second-user',
      });
      const client2 = getInstagramClient();

      expect(client1).not.toBe(client2);
      expect(getInstagramUserId()).toBe('second-user');
    });
  });
});

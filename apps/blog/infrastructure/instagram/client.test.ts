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
    vi.unstubAllEnvs();
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
      vi.stubEnv('INSTAGRAM_GRAPH_API_BASE_URL', 'https://env.api.com');
      vi.stubEnv('INSTAGRAM_LONG_ACCESS_TOKEN', 'env-token');
      vi.stubEnv('INSTAGRAM_USER_ID', 'env-user-id');

      configureInstagram();

      expect(getInstagramUserId()).toBe('env-user-id');
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
          href: expect.stringContaining(
            'https://graph.instagram.com/test-user/media'
          ),
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
});

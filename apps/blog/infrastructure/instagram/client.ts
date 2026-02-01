export interface InstagramConfig {
  baseUrl: string;
  accessToken: string;
  userId: string;
}

export interface InstagramClient {
  fetch(resource: string, params?: Record<string, string>): Promise<Response>;
}

let clientInstance: InstagramClient | null = null;
let currentConfig: InstagramConfig | null = null;

function createDefaultConfig(): InstagramConfig {
  return {
    baseUrl: process.env.INSTAGRAM_GRAPH_API_BASE_URL ?? '',
    accessToken: process.env.INSTAGRAM_LONG_ACCESS_TOKEN ?? '',
    userId: process.env.INSTAGRAM_USER_ID ?? '',
  };
}

/**
 * Configure the Instagram client.
 * This should be called once before using any Instagram operations.
 */
export function configureInstagram(config?: Partial<InstagramConfig>): void {
  const defaultConfig = createDefaultConfig();
  currentConfig = {
    baseUrl: config?.baseUrl ?? defaultConfig.baseUrl,
    accessToken: config?.accessToken ?? defaultConfig.accessToken,
    userId: config?.userId ?? defaultConfig.userId,
  };
  clientInstance = null;
}

/**
 * Ensure Instagram is configured and return the config.
 */
function getConfig(): InstagramConfig {
  if (currentConfig === null) {
    configureInstagram();
  }

  if (currentConfig === null) {
    throw new Error('Instagram configuration failed');
  }
  return currentConfig;
}

/**
 * Create the Instagram client implementation.
 */
function createClient(config: InstagramConfig): InstagramClient {
  return {
    async fetch(
      resource: string,
      params?: Record<string, string>
    ): Promise<Response> {
      const searchParams = new URLSearchParams();
      searchParams.append('access_token', config.accessToken);

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          searchParams.append(key, value);
        }
      }

      const url = new URL(`${config.baseUrl}/${resource}?${searchParams}`);
      return fetch(url);
    },
  };
}

/**
 * Get the configured Instagram client instance.
 */
export function getInstagramClient(): InstagramClient {
  const config = getConfig();

  if (!clientInstance) {
    clientInstance = createClient(config);
  }

  return clientInstance;
}

/**
 * Get the configured Instagram user ID.
 */
export function getInstagramUserId(): string {
  const config = getConfig();
  return config.userId;
}

/**
 * Reset Instagram configuration state.
 * Primarily used for testing cleanup.
 */
export function resetInstagramConfig(): void {
  currentConfig = null;
  clientInstance = null;
}

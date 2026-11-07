import { Client } from '@notionhq/client';
import type {
  GetPageResponse,
  QueryDataSourceParameters,
  QueryDataSourceResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';

export type QueryDatabaseParameters = Omit<
  QueryDataSourceParameters,
  'data_source_id'
> & { database_id: string };

export interface NotionClientConfig {
  auth?: string;
}

// biome-ignore lint/plugin/noLet: The lazy Notion client persists across server requests and test resets.
let notionClientInstance: Client | null = null;
// biome-ignore lint/plugin/noLet: The lazy converter persists across server requests and test resets.
let notionToMarkdownInstance: NotionToMarkdown | null = null;

/**
 * Create a new Notion client instance.
 */
export function createNotionClient(config?: NotionClientConfig): Client {
  return new Client({
    auth: config?.auth ?? process.env.NOTION_TOKEN ?? '',
  });
}

/**
 * Get the singleton Notion client instance.
 */
export function getNotionClient(): Client {
  if (!notionClientInstance) {
    notionClientInstance = createNotionClient();
  }
  return notionClientInstance;
}

/**
 * Create a NotionToMarkdown instance with the given client.
 */
export function createNotionToMarkdown(client: Client): NotionToMarkdown {
  return new NotionToMarkdown({ notionClient: client });
}

/**
 * Get the singleton NotionToMarkdown instance.
 */
export function getNotionToMarkdown(): NotionToMarkdown {
  if (!notionToMarkdownInstance) {
    notionToMarkdownInstance = createNotionToMarkdown(getNotionClient());
  }
  return notionToMarkdownInstance;
}

/**
 * Reset singleton instances.
 * Primarily used for testing cleanup.
 */
export function resetNotionClient(): void {
  notionClientInstance = null;
  notionToMarkdownInstance = null;
}

/**
 * Query a Notion database.
 */
export async function queryDatabase(
  client: Client,
  params: QueryDatabaseParameters
): Promise<QueryDataSourceResponse> {
  const { database_id: databaseId, ...query } = params;
  const database = await client.databases.retrieve({ database_id: databaseId });
  if (!('data_sources' in database) || database.data_sources.length !== 1) {
    throw new Error('Expected exactly one data source in the Notion database');
  }

  return client.dataSources.query({
    ...query,
    data_source_id: database.data_sources[0].id,
  });
}

/**
 * Retrieve a Notion page.
 */
export async function retrievePage(
  client: Client,
  pageId: string
): Promise<GetPageResponse> {
  return client.pages.retrieve({ page_id: pageId });
}

/**
 * Convert a Notion page to markdown string.
 */
export async function pageToMarkdownString(
  n2m: NotionToMarkdown,
  pageId: string
): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdBlocks);
  return mdString.parent;
}

export type { Client, NotionToMarkdown };

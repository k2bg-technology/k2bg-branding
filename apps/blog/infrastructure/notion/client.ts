import { Client } from '@notionhq/client';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';

export interface NotionClientConfig {
  auth?: string;
}

let notionClientInstance: Client | null = null;
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
) {
  return client.databases.query(params);
}

/**
 * Retrieve a Notion page.
 */
export async function retrievePage(client: Client, pageId: string) {
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

export type { Client, NotionToMarkdown, QueryDatabaseParameters };

import { Client } from '@notionhq/client';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import type { BlockType, CustomTransformer } from 'notion-to-md/build/types';

export class Core {
  private notionClient: Client;

  protected n2m: NotionToMarkdown;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_TOKEN ?? '',
    });

    this.n2m = new NotionToMarkdown({ notionClient: this.notionClient });
  }

  public fetchDatabase(args: QueryDatabaseParameters) {
    return this.notionClient.databases.query(args);
  }

  public fetchPage(pageId: string) {
    return this.notionClient.pages.retrieve({
      page_id: pageId,
    });
  }

  setCustomTransformer(type: BlockType, transformer: CustomTransformer) {
    this.n2m.setCustomTransformer(type, transformer);
  }

  async fetchNotionPageAndConvertMarkdownString(pageId: string) {
    const mdblocks = await this.n2m.pageToMarkdown(pageId);
    const mdString = this.n2m.toMarkdownString(mdblocks);

    return mdString.parent;
  }
}

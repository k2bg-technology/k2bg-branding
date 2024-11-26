import { Client } from '@notionhq/client';

export class Core {
  protected notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_TOKEN ?? '',
    });
  }
}

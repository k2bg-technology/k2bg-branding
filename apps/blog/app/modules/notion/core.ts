import { Client } from '@notionhq/client';

export class Core {
  private notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      auth: process.env.NOTION_TOKEN ?? '',
    });
  }

  protected fetchDatabase() {
    return this.notionClient.databases.query({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      database_id: process.env.NOTION_DATABASE_ID ?? '',
    });
  }
}

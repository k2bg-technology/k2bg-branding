import { Client, LogLevel } from '@notionhq/client';

export class Core {
  protected notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      auth: process.env.NOTION_TOKEN ?? '',
      logLevel: LogLevel.DEBUG,
    });
  }
}

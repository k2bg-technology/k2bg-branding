import { Core } from './core';

export class Fetcher extends Core {
  public fetchDatabase() {
    return this.notionClient.databases.query({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      database_id: process.env.NOTION_DATABASE_ID ?? '',
    });
  }

  public fetchPage(pageId: string) {
    return this.notionClient.pages.retrieve({
      page_id: pageId,
    });
  }
}

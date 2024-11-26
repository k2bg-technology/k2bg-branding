import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

import { Core } from './core';

export class Fetcher extends Core {
  public fetchDatabase(args?: Omit<QueryDatabaseParameters, 'database_id'>) {
    return this.notionClient.databases.query({
      ...args,
      database_id: process.env.NOTION_DATABASE_ID ?? '',
    });
  }

  public fetchPage(pageId: string) {
    return this.notionClient.pages.retrieve({
      page_id: pageId,
    });
  }
}

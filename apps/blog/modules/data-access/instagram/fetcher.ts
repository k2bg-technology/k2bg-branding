import { INSTAGRAM_USER_ID } from './const';
import { Core } from './core';

export class Fetcher extends Core {
  public async fetchUserMedia(): Promise<{
    data: { id: string }[] | undefined;
  }> {
    return (await this.fetch(`${INSTAGRAM_USER_ID}/media`)).json();
  }

  public async fetchMediaData(id: string): Promise<{
    id: string;
    media_type: string;
    media_url: string;
    permalink: string;
    thumbnail_url: string;
    timestamp: string;
  }> {
    const optionalParams = {
      fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp',
    };
    return (await this.fetch(id, optionalParams)).json();
  }
}

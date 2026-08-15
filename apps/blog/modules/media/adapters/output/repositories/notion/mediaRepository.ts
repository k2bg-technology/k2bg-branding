import { APIResponseError, type Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type { Media, MediaId, MediaRepository } from '../../../../domain';
import { ExternalSourceError, mediaLogger } from '../../../shared';
import { notionPageToMedia } from '../../external-sources/notion/mapper';

export class NotionMediaRepository implements MediaRepository {
  constructor(private readonly notionClient: Client) {}

  async findById(id: MediaId): Promise<Media | null> {
    try {
      const page = await this.notionClient.pages.retrieve({
        page_id: id.getValue(),
      });

      if (!('properties' in page)) {
        return null;
      }

      return notionPageToMedia(page as PageObjectResponse);
    } catch (error) {
      if (error instanceof APIResponseError && error.status === 404) {
        return null;
      }
      mediaLogger.error(
        { err: error, mediaId: id.getValue() },
        'Failed to fetch media from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }
}

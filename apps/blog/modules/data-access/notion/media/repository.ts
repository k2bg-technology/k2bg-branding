import type * as Domain from '../../../domain';
import { Core } from '../core';
import { Page } from '../page';

import { Entity } from './entity';

const DATABASE_ID = process.env.NOTION_MEDIA_DATABASE_ID ?? '';

export class Repository extends Core implements Domain.Media.InputRepository {
  async getAllImageSources() {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'type',
            select: {
              equals: 'MEDIA_IMAGE',
            },
          },
        ],
      },
    });

    const sourceImages = database.results
      .map((result) => {
        const notionPage = new Page(result);
        const media = new Entity(notionPage);
        const sourceImage = media.sourceFile || media.sourceUrl;

        if (!sourceImage) return null;

        return {
          id: media.id,
          url: sourceImage,
        };
      })
      .filter((sourceImage) => !!sourceImage);

    return sourceImages;
  }
}

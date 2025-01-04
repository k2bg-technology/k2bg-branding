import * as Domain from '../../../domain';
import { Core } from '../core';
import { Page } from '../page';
import * as DataType from '../data-type';

import { Banner } from './banner';
import { Product } from './product';

const DATABASE_ID = process.env.NOTION_AFFILIATE_DATABASE_ID ?? '';

export class Repository
  extends Core
  implements Domain.Affiliate.InputRepository
{
  async getAllImageSources() {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
    });

    const sourceImages = database.results
      .map((result) => {
        const notionPage = new Page(result);
        const dataType = new DataType.Entity(notionPage).name;
        const sourceImage = (() => {
          if (dataType === 'AFFILIATE_BANNER')
            return new Banner(notionPage).imageSourceUrl;

          if (dataType === 'AFFILIATE_PRODUCT')
            return new Product(notionPage).imageSourceUrl;

          return undefined;
        })();

        if (!sourceImage) return null;

        return {
          id: notionPage.id,
          url: sourceImage,
        };
      })
      .filter((sourceImage) => !!sourceImage);

    return sourceImages;
  }
}

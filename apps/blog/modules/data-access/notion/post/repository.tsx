import { Order } from '../../../domain/post/types';
import * as Domain from '../../../domain';
import { Core } from '../core';
import { Page } from '../page';
import { Markdown } from '../../../../components/markdown';
import { postSchema } from '../../../interfaces/post/validator';
import {
  affiliateTextSchema,
  affiliateBannerSchema,
  affiliateProductSchema,
  affiliateSubProviderSchema,
} from '../../../interfaces/affiliate/validator';
import {
  mediaImageSchema,
  mediaVideoSchema,
} from '../../../interfaces/media/validator';
import * as DataType from '../data-type';
import * as Media from '../media';
import * as Affiliate from '../affiliate';

import { Entity } from './entity';

const DATABASE_ID = process.env.NOTION_POST_DATABASE_ID ?? '';

export class Repository extends Core implements Domain.Post.InputRepository {
  async getAllPosts(orderBy: Order = 'desc') {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'status',
            status: {
              equals: 'PUBLISHED',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'releaseDate',
          direction: orderBy === 'asc' ? 'ascending' : 'descending',
        },
      ],
    });

    const posts = await Promise.all(
      database.results.map(async (result) => {
        const notionPage = new Page(result);
        const post = new Entity(notionPage);
        const markdownString = await this.generateMarkdownString(post.id);

        return postSchema.parse({
          ...post.toObject(),
          // TODO: Implement tags
          tags: [],
          content: markdownString,
        });
      })
    );

    return posts;
  }

  async getAllHeroImageSources() {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'status',
            status: {
              equals: 'PUBLISHED',
            },
          },
        ],
      },
    });

    const heroImages = database.results
      .map((result) => {
        const notionPage = new Page(result);
        const post = new Entity(notionPage);

        if (!post.imageUrl) return null;

        return {
          id: post.id,
          url: post.imageUrl,
        };
      })
      .filter((post) => !!post);

    return heroImages;
  }

  async generateMarkdownString(pageId: string) {
    const { renderToString } = await import('react-dom/server');

    this.n2m.setCustomTransformer('link_to_page', (block) => {
      if (!('link_to_page' in block && 'page_id' in block.link_to_page))
        return false;

      return `<LinkToPage>${block.link_to_page.page_id}</LinkToPage>`;
    });

    const markdownStringWithoutAssets =
      await this.fetchNotionPageAndConvertMarkdownString(pageId);

    const regex = /<LinkToPage>([^<]+)<\/LinkToPage>/g;
    const matches = Array.from(
      markdownStringWithoutAssets.matchAll(regex),
      (m) => m[1]
    );

    const assets = await Promise.all(
      matches.map(async (assetId) => {
        const asset = new Page(await this.fetchPage(assetId));

        const dataType = new DataType.Entity(asset).name;

        switch (dataType) {
          case 'MEDIA_IMAGE': {
            const mediaImage = mediaImageSchema.parse(
              new Media.Image(asset).toObject()
            );

            return renderToString(
              <Markdown.MediaImage mediaImage={mediaImage} />
            );
          }
          case 'MEDIA_VIDEO': {
            const mediaVideo = mediaVideoSchema.parse(
              new Media.Video(asset).toObject()
            );

            return renderToString(
              <Markdown.MediaVideo mediaVideo={mediaVideo} />
            );
          }
          case 'AFFILIATE_TEXT': {
            const affiliateText = affiliateTextSchema.parse(
              new Affiliate.Text(asset).toObject()
            );

            return renderToString(
              <Markdown.AffiliateText affiliateText={affiliateText} />
            );
          }
          case 'AFFILIATE_BANNER': {
            const affiliateBanner = affiliateBannerSchema.parse(
              new Affiliate.Banner(asset).toObject()
            );

            return renderToString(
              <Markdown.AffiliateBanner affiliateBanner={affiliateBanner} />
            );
          }
          case 'AFFILIATE_PRODUCT': {
            const affiliateProduct = affiliateProductSchema.parse(
              new Affiliate.Product(asset).toObject()
            );

            const subProviders = await Promise.all(
              affiliateProduct.subProviders.map(async (subProvider) =>
                affiliateSubProviderSchema.parse(
                  new Affiliate.SubProvider(
                    new Page(await this.fetchPage(subProvider))
                  ).toObject()
                )
              )
            );

            return renderToString(
              <Markdown.AffiliateProduct
                affiliateProduct={affiliateProduct}
                subProviders={subProviders}
              />
            );
          }
          default:
            return null;
        }
      })
    );

    const markdownString = markdownStringWithoutAssets
      .replace(
        regex,
        (_, replaceValue) =>
          assets.find((asset) => asset && asset.includes(replaceValue)) || ''
      )
      // Insert zero-width joiner before/after ** to help markdown parser recognize bold text correctly
      // @see {@link https://github.com/Textualize/rich/issues/400}
      .replace(/\*\*(\S)/g, '**\u200B$1')
      .replace(/(\S)\*\*/g, '$1\u200B**');

    return markdownString;
  }
}

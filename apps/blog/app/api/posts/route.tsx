import { postSchema } from '../../../modules/interfaces/post/validator';
import Cloudinary from '../../../modules/data-access/cloudinary';
import * as Notion from '../../../modules/data-access/notion';
import * as Prisma from '../../../modules/data-access/prisma';
import { Markdown } from '../../../components/markdown';
import {
  mediaImageSchema,
  mediaVideoSchema,
} from '../../../modules/interfaces/media/validator';
import {
  affiliateBannerSchema,
  affiliateProductSchema,
  affiliateSubProviderSchema,
  affiliateTextSchema,
} from '../../../modules/interfaces/affiliate/validator';

const generateMarkdownString = async (pageId: string) => {
  const { renderToString } = await import('react-dom/server');

  const notionFetcher = new Notion.Fetcher();
  const n2m = new Notion.N2m();

  n2m.setCustomTransformer('link_to_page', (block) => {
    if (!('link_to_page' in block && 'page_id' in block.link_to_page))
      return false;

    return `<LinkToPage>${block.link_to_page.page_id}</LinkToPage>`;
  });

  const markdownStringWithoutAssets =
    await n2m.fetchNotionPageAndConvertMarkdownString(pageId);

  const regex = /<LinkToPage>([^<]+)<\/LinkToPage>/g;
  const matches = Array.from(
    markdownStringWithoutAssets.matchAll(regex),
    (m) => m[1]
  );

  const assets = await Promise.all(
    matches.map(async (assetId) => {
      const asset = new Notion.Page(await notionFetcher.fetchPage(assetId));

      const dataType = new Notion.DataType.Core(asset).name;

      switch (dataType) {
        case 'MEDIA_IMAGE': {
          const mediaImage = mediaImageSchema.parse(
            new Notion.Media.Image(asset).toObject()
          );

          const imageSource = mediaImage.sourceUrl || mediaImage.sourceFile;
          if (imageSource) {
            await new Cloudinary.Uploader().uploadImage(imageSource, {
              public_id: mediaImage.id,
            });
          }

          return renderToString(
            <Markdown.MediaImage mediaImage={mediaImage} />
          );
        }
        case 'MEDIA_VIDEO': {
          const mediaVideo = mediaVideoSchema.parse(
            new Notion.Media.Video(asset).toObject()
          );

          return renderToString(
            <Markdown.MediaVideo mediaVideo={mediaVideo} />
          );
        }
        case 'AFFILIATE_TEXT': {
          const affiliateText = affiliateTextSchema.parse(
            new Notion.Affiliate.Text(asset).toObject()
          );

          return renderToString(
            <Markdown.AffiliateText affiliateText={affiliateText} />
          );
        }
        case 'AFFILIATE_BANNER': {
          const affiliateBanner = affiliateBannerSchema.parse(
            new Notion.Affiliate.Banner(asset).toObject()
          );

          const imageSource = affiliateBanner.imageSourceUrl;
          if (imageSource) {
            await new Cloudinary.Uploader().uploadImage(imageSource, {
              public_id: affiliateBanner.id,
            });
          }

          return renderToString(
            <Markdown.AffiliateBanner affiliateBanner={affiliateBanner} />
          );
        }
        case 'AFFILIATE_PRODUCT': {
          const affiliateProduct = affiliateProductSchema.parse(
            new Notion.Affiliate.Product(asset).toObject()
          );

          const imageSource = affiliateProduct.imageSourceUrl;
          if (imageSource) {
            await new Cloudinary.Uploader().uploadImage(imageSource, {
              public_id: affiliateProduct.id,
            });
          }

          const subProviders = await Promise.all(
            affiliateProduct.subProviders.map(async (subProvider) =>
              affiliateSubProviderSchema.parse(
                new Notion.Affiliate.SubProvider(
                  new Notion.Page(await notionFetcher.fetchPage(subProvider))
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

  const markdownString = markdownStringWithoutAssets.replace(
    regex,
    (_, replaceValue) =>
      assets.find((asset) => asset && asset.includes(replaceValue)) || ''
  );

  return markdownString;
};

export async function PATCH() {
  const notionDatabase = await new Notion.Fetcher().fetchDatabase({
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

  const posts = await Promise.all(
    notionDatabase.results.map(async (result) => {
      const notionPage = new Notion.Page(result);
      const notionPost = new Notion.Post.Single(notionPage);
      const markdownString = await generateMarkdownString(notionPost.id);

      if (notionPost.imageUrl) {
        await new Cloudinary.Uploader().uploadImage(notionPost.imageUrl, {
          public_id: notionPost.id,
        });
      }

      return postSchema.parse({
        ...notionPost.toObject(),
        // TODO: Implement tags
        tags: [],
        content: markdownString,
      });
    })
  );

  const postRepository = new Prisma.PostRepository();
  await postRepository.upsertAllPosts(posts);

  return Response.json(posts);
}

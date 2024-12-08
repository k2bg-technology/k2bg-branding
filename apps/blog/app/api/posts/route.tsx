import {
  ImageViewer,
  VideoStreamingPlayer,
  VideoFilePlayer,
  TextPromotion,
  BannerPromotion,
  ProductPromotion,
} from 'ui';

import { postSchema } from '../../../modules/interfaces/post/validator';
import Cloudinary from '../../../modules/data-access/cloudinary';
import * as Notion from '../../../modules/data-access/notion';
import * as Prisma from '../../../modules/data-access/prisma';

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
          const mediaImage = new Notion.Media.Image(asset);

          const imageUrl = mediaImage.url || mediaImage.file;

          if (imageUrl) {
            await new Cloudinary.Uploader().uploadImage(imageUrl, {
              public_id: mediaImage.id,
            });
          }

          return renderToString(
            <div className="mt-4">
              <ImageViewer
                id={assetId}
                name={mediaImage.name}
                url={mediaImage.url}
                file={mediaImage.file}
                width={mediaImage.width}
                height={mediaImage.height}
                unoptoinized={mediaImage.extension === '.gif'}
              />
            </div>
          );
        }
        case 'MEDIA_VIDEO': {
          const mediaVideo = new Notion.Media.Video(asset);

          if (mediaVideo.url) {
            return renderToString(
              <div className="flex justify-center mt-8">
                <VideoStreamingPlayer
                  id={assetId}
                  url={mediaVideo.url}
                  width={mediaVideo.width}
                  height={mediaVideo.height}
                />
              </div>
            );
          }

          if (mediaVideo.file) {
            return renderToString(
              <div className="flex justify-center mt-8">
                <VideoFilePlayer
                  id={assetId}
                  file={mediaVideo.file}
                  width={mediaVideo.width}
                  height={mediaVideo.height}
                />
              </div>
            );
          }
          return null;
        }
        case 'AFFILIATE_TEXT': {
          const textAffiliate = new Notion.Affiliate.Text(asset);

          return renderToString(
            <div className="mt-8">
              <TextPromotion id={assetId} href={textAffiliate.linkUrl}>
                {textAffiliate.linkText}
              </TextPromotion>
            </div>
          );
        }
        case 'AFFILIATE_BANNER': {
          const bannerAffiliate = new Notion.Affiliate.Banner(asset);

          if (bannerAffiliate.imageUrl) {
            await new Cloudinary.Uploader().uploadImage(
              bannerAffiliate.imageUrl,
              {
                public_id: bannerAffiliate.id,
              }
            );
          }

          return renderToString(
            <div className="mt-8">
              <BannerPromotion
                id={assetId}
                linkText={bannerAffiliate.linkText}
                linkUrl={bannerAffiliate.linkUrl}
                imageUrl={bannerAffiliate.imageUrl}
                imageWidth={bannerAffiliate.imageWidth}
                imageHeight={bannerAffiliate.imageHeight}
              />
            </div>
          );
        }
        case 'AFFILIATE_PRODUCT': {
          const productAffiliate = new Notion.Affiliate.Product(asset);

          if (productAffiliate.imageFile) {
            await new Cloudinary.Uploader().uploadImage(
              productAffiliate.imageFile,
              {
                public_id: productAffiliate.id,
              }
            );
          }

          const providers = await Promise.all(
            productAffiliate.subProviders.map(async (subProvider) => {
              const provider = new Notion.Affiliate.SubProvider(
                new Notion.Page(await notionFetcher.fetchPage(subProvider))
              );

              return {
                linkText: provider.provider,
                linkUrl: provider.linkUrl,
                color: provider.providerColor,
              };
            })
          );

          return renderToString(
            <div className="mt-8">
              <ProductPromotion
                id={assetId}
                linkText={productAffiliate.linkText}
                linkUrl={productAffiliate.linkUrl}
                imageUrl={productAffiliate.imageFile}
                imageWidth={productAffiliate.imageWidth}
                imageHeight={productAffiliate.imageHeight}
                providers={[
                  {
                    linkText: productAffiliate.provider,
                    linkUrl: productAffiliate.linkUrl,
                    color: productAffiliate.providerColor,
                  },
                  ...providers,
                ]}
              />
            </div>
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
  const postRepository = new Prisma.PostRepository();

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
        id: notionPost.id,
        title: notionPost.title,
        type: notionPost.type,
        excerpt: notionPost.excerpt,
        imageUrl: notionPost.imageUrl,
        slug: notionPost.slug,
        status: notionPost.status,
        category: notionPost.category,
        // TODO: Implement tags
        tags: [],
        content: markdownString,
        author: {
          id: notionPost.author?.id,
          name: notionPost.author?.name,
          avatarUrl: notionPost.author?.avatarUrl,
        },
        releaseDate: notionPost.releaseDate,
        revisionDate: notionPost.revisionDate,
      });
    })
  );

  await postRepository.upsertAllPosts(posts);

  return Response.json(posts);
}

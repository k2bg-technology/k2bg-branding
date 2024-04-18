import Image from 'next/image';
import Link from 'next/link';
import {
  Avatar,
  BannerPromotion,
  BlogCard,
  ProductPromotion,
  TextPromotion,
  ImageViewer,
  VideoFilePlayer,
  VideoStreamingPlayer,
} from 'ui';

import { N2m } from '../../../modules/data-access/notion/n2m';
import Notion from '../../../modules/data-access/notion';
import Article from '../../../modules/domain/article';
import Affiliate from '../../../modules/domain/affiliate';
import Media from '../../../modules/domain/media';
import DataType from '../../../modules/domain/data-type';
import NotionMarkdown from '../../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../../components/sidebar/Sidebar';
import { fetchDatabase } from '../../page';
import { convertImageExternalToLocal } from '../../../modules/utility/convertImageExternalToLocal';

export const revalidate = 60 * 60;

export async function generateStaticParams() {
  const database = await fetchDatabase();
  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Article.List(pages);

  return articles.all.map((article) => ({
    slug: article.slug,
  }));
}

const getArticle = async (pageId: string) => {
  const { renderToString } = await import('react-dom/server');

  const notionFetcher = new Notion.Fetcher();
  const n2m = new N2m();

  n2m.setCustomTransformer('link_to_page', async (block) => {
    const page = new Notion.Page(
      // @ts-expect-error link_to_page defined in the block
      await notionFetcher.fetchPage(block.link_to_page.page_id)
    );
    const dataType = new DataType.Core(page).name;

    if (dataType === 'mediaImage') {
      try {
        const mediaImage = new Media.Image(page);

        if (mediaImage.file)
          await convertImageExternalToLocal(
            mediaImage.file,
            `${mediaImage.name}.jpg`
          );

        return renderToString(
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <ImageViewer
              name={mediaImage.name}
              url={mediaImage.url}
              file={`/images/${mediaImage.name}.jpg`}
              width={mediaImage.width}
              height={mediaImage.height}
            />
          </div>
        );
      } catch (error) {
        return '';
      }
    }

    if (dataType === 'mediaVideo') {
      try {
        const mediaVideo = new Media.Video(page);

        if (mediaVideo.url) {
          return renderToString(
            <div className="flex justify-center mt-8">
              <VideoStreamingPlayer
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
                file={mediaVideo.file}
                width={mediaVideo.width}
                height={mediaVideo.height}
              />
            </div>
          );
        }
      } catch (error) {
        return '';
      }
    }

    if (dataType === 'affiliateText') {
      try {
        const textAffiliate = new Affiliate.Text(page);

        return renderToString(
          <div className="mt-8">
            <TextPromotion
              linkText={textAffiliate.linkText}
              linkUrl={textAffiliate.linkUrl}
            />
          </div>
        );
      } catch (error) {
        return '';
      }
    }

    if (dataType === 'affiliateBanner') {
      try {
        const bannerAffiliate = new Affiliate.Banner(page);

        return renderToString(
          <div className="mt-8">
            <BannerPromotion
              linkText={bannerAffiliate.linkText}
              linkUrl={bannerAffiliate.linkUrl}
              imageUrl={bannerAffiliate.imageUrl}
              imageWidth={bannerAffiliate.imageWidth}
              imageHeight={bannerAffiliate.imageHeight}
            />
          </div>
        );
      } catch (error) {
        return '';
      }
    }

    if (dataType === 'affiliateProduct') {
      try {
        const productAffiliate = new Affiliate.Product(page);

        const providers = await Promise.all(
          productAffiliate.subProviders.map(async (subProvider) => {
            const provider = new Affiliate.SubProvider(
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
      } catch (error) {
        return '';
      }
    }

    return '';
  });

  const notionMarkdownString =
    await n2m.fetchNotionPageAndConvertMarkdownString(pageId);
  const page = new Notion.Page(await notionFetcher.fetchPage(pageId));
  const article = new Article.Single(page);

  return {
    article,
    notionMarkdownString,
  };
};

export default async function Page({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const { article, notionMarkdownString } = await getArticle(params.id);

  if (article.image)
    await convertImageExternalToLocal(article.image, `${article.id}.jpg`);

  const { base64 } = await article.imagePlaceholder;

  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
        <BlogCard className="flex-col gap-6">
          <BlogCard.Content
            category={
              <Link href={`/category/${article.category}`}>
                {article.category}
              </Link>
            }
            heading={
              <h1 className="text-header-1 font-bold">{article.title}</h1>
            }
            excerpt={article.excerpt}
            avatar={
              article.author && (
                <Avatar
                  image={
                    <div className="relative w-full h-full">
                      <Image
                        alt="author"
                        src={article.author.avatar_url ?? ''}
                        className="aspect-square h-full w-full object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  }
                  name={article.author.name ?? ''}
                />
              )
            }
            date={article.releaseDate}
          />
          <BlogCard.Media className="relative w-full h-[37.6rem]">
            {article.image && (
              <Image
                alt="media"
                src={`/images/${article.id}.jpg`}
                className="aspect-square h-full w-full object-cover"
                fill
                sizes="100%"
                placeholder="blur"
                blurDataURL={base64}
              />
            )}
          </BlogCard.Media>
        </BlogCard>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="col-start-1 col-end-10">
          <NotionMarkdown markdownString={notionMarkdownString} />
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

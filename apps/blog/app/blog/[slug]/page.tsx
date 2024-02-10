import Image from 'next/image';
import Link from 'next/link';
import {
  Avatar,
  BannerPromotion,
  BlogCard,
  ProductPromotion,
  TextPromotion,
} from 'ui';

import { N2m } from '../../modules/notion/n2m';
import Notion from '../../modules/notion';
import Blog from '../../modules/blog';
import Affiliate from '../../modules/affiliate';
import NotionMarkdown from '../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../components/sidebar/Sidebar';

export default async function Page({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { renderToString } = await import('react-dom/server');

  const notionFetcher = new Notion.Fetcher();
  const n2m = new N2m();

  n2m.setCustomTransformer('link_to_page', async (block) => {
    const page = new Notion.Page(
      // @ts-expect-error link_to_page defined in the block
      await notionFetcher.fetchPage(block.link_to_page.page_id)
    );
    const affiliateType = Affiliate.getType(page);

    if (affiliateType === 'text') {
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

    if (affiliateType === 'banner') {
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

    if (affiliateType === 'product') {
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
              providers={providers}
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
    await n2m.fetchNotionPageAndConvertMarkdownString(searchParams.id);
  const page = new Notion.Page(await notionFetcher.fetchPage(searchParams.id));
  const article = new Blog.Article(page);

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
              <h1 className="text-heading-1 font-bold">{article.title}</h1>
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
            date={article.date}
          />
          <BlogCard.Media className="relative w-full h-[37.6rem]">
            {article.image && (
              <Image
                alt="media"
                src={article.image}
                className="aspect-square h-full w-full object-cover"
                fill
                sizes="100%"
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

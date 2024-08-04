import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import {
  BannerPromotion,
  ProductPromotion,
  TextPromotion,
  ImageViewer,
  VideoFilePlayer,
  VideoStreamingPlayer,
} from 'ui';

import { N2m } from '../../modules/data-access/notion/n2m';
import Notion from '../../modules/data-access/notion';
import Affiliate from '../../modules/domain/affiliate';
import Media from '../../modules/domain/media';
import DataType from '../../modules/domain/data-type';
import Cloudinary from '../../modules/data-access/cloudinary';

const getArticle = async (pageId: string) => {
  const { renderToString } = await import('react-dom/server');

  const notionFetcher = new Notion.Fetcher();
  const n2m = new N2m();

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

      const dataType = new DataType.Core(asset).name;

      switch (dataType) {
        case 'mediaImage':
          const mediaImage = new Media.Image(asset);

          const optimizedImageFileUrl = await mediaImage.getOptimizedUrl(
            async (id, file) => {
              await new Cloudinary.Uploader().uploadImage(file, {
                public_id: id,
              });

              return new Cloudinary.Fetcher().getImageUrl(id, {
                fetch_format: 'auto',
                quality: 'auto',
              });
            }
          );

          return renderToString(
            <div className="mt-4">
              <ImageViewer
                id={assetId}
                name={mediaImage.name}
                url={mediaImage.url}
                file={optimizedImageFileUrl}
                width={mediaImage.width}
                height={mediaImage.height}
                placeholder={await mediaImage.placeholder}
                unoptoinized={mediaImage.extension === '.gif'}
              />
            </div>
          );
        case 'mediaVideo':
          const mediaVideo = new Media.Video(asset);

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
        case 'affiliateText':
          const textAffiliate = new Affiliate.Text(asset);

          return renderToString(
            <div className="mt-8">
              <TextPromotion
                id={assetId}
                linkText={textAffiliate.linkText}
                linkUrl={textAffiliate.linkUrl}
              />
            </div>
          );
        case 'affiliateBanner':
          const bannerAffiliate = new Affiliate.Banner(asset);

          const optimizedBannerImageUrl = await bannerAffiliate.getOptimizedUrl(
            async (id, url) => {
              await new Cloudinary.Uploader().uploadImage(url, {
                public_id: id,
              });

              return new Cloudinary.Fetcher().getImageUrl(id, {
                fetch_format: 'auto',
                quality: 'auto',
              });
            }
          );

          return renderToString(
            <div className="mt-8">
              <BannerPromotion
                id={assetId}
                linkText={bannerAffiliate.linkText}
                linkUrl={bannerAffiliate.linkUrl}
                imageUrl={optimizedBannerImageUrl}
                imageWidth={bannerAffiliate.imageWidth}
                imageHeight={bannerAffiliate.imageHeight}
                imagePlaceholder={await bannerAffiliate.imagePlaceholder}
              />
            </div>
          );
        case 'affiliateProduct':
          const productAffiliate = new Affiliate.Product(asset);
          const optimizedProductImageUrl =
            await productAffiliate.getOptimizedUrl(async (id, url) => {
              await new Cloudinary.Uploader().uploadImage(url, {
                public_id: id,
              });

              return new Cloudinary.Fetcher().getImageUrl(id, {
                fetch_format: 'auto',
                quality: 'auto',
              });
            });

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
                id={assetId}
                linkText={productAffiliate.linkText}
                linkUrl={productAffiliate.linkUrl}
                imageUrl={optimizedProductImageUrl}
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
                imagePlaceholder={await productAffiliate.imagePlaceholder}
              />
            </div>
          );
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

  return {
    markdownString,
  };
};

interface Props {
  articleId: string;
}

export default async function NotionMarkdown(props: Props) {
  const { articleId } = props;

  const { markdownString } = await getArticle(articleId);

  return (
    <ReactMarkdown
      className="markdown"
      // @ts-expect-error rehypeRaw, remarkGfm
      rehypePlugins={[rehypeRaw, remarkGfm]}
      components={{
        h1: ({ children, ...props }) => (
          <h1
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="text-header-1 leading-header-1 font-bold"
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-20 text-header-2 leading-header-2 font-bold"
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-12 text-header-3 leading-header-3 font-bold"
          >
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-4 text-body-r-sm leading-body-r-sm text-base-black/80 text-justify"
          >
            {children}
          </p>
        ),
        a: ({ children, ...props }) => {
          const { href, className } = props;

          return (
            <Link
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              href={href || ''}
              rel="noopener noreferrer"
              target="_blank"
              className={className || 'underline hover:opacity-80'}
            >
              {children}
            </Link>
          );
        },
        ul: ({ children, ...props }) => {
          const { className } = props;

          return (
            <ul
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              className={className || 'mt-4 list-disc list-inside'}
            >
              {children}
            </ul>
          );
        },
        li: ({ children, ...props }) => {
          const { className } = props;

          return (
            <li
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              className={
                className ||
                'text-body-r-sm leading-body-r-sm text-base-black/80 text-justify'
              }
            >
              {children}
            </li>
          );
        },
        strong: ({ children, ...props }) => (
          <span
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="mt-6 font-bold leading-none underline decoration-8 underline-offset-[-0.2em] decoration-main-default/50"
          >
            {children}
          </span>
        ),
        pre: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <pre {...props} className="first:mt-0 mt-4 border rounded-lg">
            {children}
          </pre>
        ),
        code: ({ children, ...props }) => {
          const { inline, className } = props;

          const language = className?.split('-')[1];

          if (inline)
            return (
              <code className="rounded-md bg-base-white/80 text-body-r-sm text-accent-dark inline-block mx-1 px-2 py-1 leading-none">
                {children}
              </code>
            );

          return typeof children?.[0] === 'string' ? (
            <SyntaxHighlighter
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              codeTagProps={{
                className: 'text-body-r-sm font-original',
              }}
              customStyle={{ padding: '1.5rem', borderRadius: '0.5rem' }}
              language={language}
              style={a11yDark}
              wrapLines
              wrapLongLines
            >
              {children?.[0]?.trim()}
            </SyntaxHighlighter>
          ) : null;
        },
        blockquote: ({ children, ...props }) => (
          <blockquote
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-4 border-l-4 border-slate-100 pl-4"
          >
            {children}
          </blockquote>
        ),
        img: ({ className, src, alt, width, height, node }) => {
          if (!(src && alt && width && height)) return null;

          const placeholder = String(node.properties?.['dataPlaceholder']);
          const unoptimized = Boolean(node.properties?.['dataUnoptoinized']);

          return (
            <Image
              className={className || 'first:mt-0 mt-8 mx-auto'}
              src={src}
              alt={alt}
              width={Number(width)}
              height={Number(height)}
              placeholder="blur"
              blurDataURL={placeholder || 'data:image/png;base64'}
              quality={30}
              unoptimized={unoptimized}
            />
          );
        },
      }}
    >
      {markdownString}
    </ReactMarkdown>
  );
}

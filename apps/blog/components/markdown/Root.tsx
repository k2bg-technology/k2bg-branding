import type { Root as MdastRoot } from 'mdast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { codeToHtml } from 'shiki';
import { addCopyButton } from 'shiki-transformer-copy-button';
import { visit } from 'unist-util-visit';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

import styles from './Root.module.css';

function remarkEmbed() {
  return (tree: MdastRoot) => {
    visit(tree, 'leafDirective', (node) => {
      if (node.name === 'embed') {
        node.data = {
          hName: 'embed',
          hProperties: node.attributes ?? {},
        };
      }
    });
  };
}

interface Props {
  content: string;
}

export async function Root(props: Props) {
  const { content } = props;

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm, remarkDirective, remarkEmbed]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-heading-1 leading-heading-1 font-bold">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="first:mt-0 mt-12 text-heading-2 leading-heading-2 font-bold">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="first:mt-0 mt-8 text-heading-3 leading-heading-3 font-bold">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="first:mt-0 mt-4 text-body-r-md leading-body-r-md text-base-black text-justify">
            {children}
          </p>
        ),
        a: ({ children, ...rest }) => {
          const { href, className, style } = rest;

          return (
            <Link
              href={href || ''}
              rel="noopener noreferrer"
              target="_blank"
              className={className || 'underline hover:opacity-80'}
              style={style}
            >
              {children}
            </Link>
          );
        },
        ol: ({ children, ...rest }) => {
          const { className } = rest;

          return (
            <ol className={className || 'mt-2 list-decimal pl-8'}>
              {children}
            </ol>
          );
        },
        ul: ({ children, ...rest }) => {
          const { className } = rest;

          return (
            <ul className={className || 'mt-2 list-disc pl-8'}>{children}</ul>
          );
        },
        li: ({ children, ...rest }) => {
          const { className } = rest;

          return (
            <li
              className={
                className ||
                'text-body-r-md leading-body-r-md text-base-black text-justify'
              }
            >
              {children}
            </li>
          );
        },
        strong: ({ children }) => (
          <span className="mt-2 font-bold leading-none">{children}</span>
        ),
        pre: ({ children }) => (
          <pre className="first:mt-0 mt-2">{children}</pre>
        ),
        code: async ({ children, className }) => {
          const isInline =
            typeof children === 'string' && children.split('\n').length === 1;

          const language = className?.split('-')[1];

          if (isInline)
            return (
              <code className="rounded-md bg-base-white/80 text-body-r-sm text-accent-dark inline-block mx-1 px-2 py-1 leading-none">
                {children}
              </code>
            );

          const html =
            typeof children === 'string'
              ? await codeToHtml(children, {
                  lang: language || '',
                  theme: 'kanagawa-wave',
                  /** @see {@link https://shiki.matsu.io/guide/transformers} */
                  transformers: [
                    {
                      pre(node) {
                        this.addClassToHast(
                          node,
                          `${styles.codeSnippet} p-6 whitespace-pre-wrap rounded-lg relative before:content-[attr(data-language)] overflow-hidden before:absolute before:bottom-0 before:right-0 before:px-3 before:py-1 before:text-caption before:bg-white/20 before:text-white text-body-r-sm font-original`
                        );

                        node.properties['data-language'] = language;
                      },
                    },
                    addCopyButton({
                      toggle: 2000,
                    }),
                  ],
                })
              : null;

          if (html) return <div dangerouslySetInnerHTML={{ __html: html }} />;

          return null;
        },
        blockquote: ({ children }) => (
          <blockquote className="first:mt-0 mt-2 border-l-4 border-slate-100 pl-2">
            {children}
          </blockquote>
        ),
        img: ({ className, src, alt, width, height, node }) => {
          if (!(src && alt && width && height)) return null;

          const id = String(node?.properties?.dataId) || '';
          const unoptimized = Boolean(node?.properties?.dataUnoptoinized);

          return (
            <CloudinaryImage
              publicId={id}
              className={className || 'first:mt-0 mt-5 mx-auto'}
              src={src}
              alt={alt}
              width={Number(width)}
              height={Number(height)}
              quality={30}
              unoptimized={unoptimized}
            />
          );
        },
        table: ({ children }) => (
          <table className="mt-4 w-full text-body-r-sm border-base-white">
            {children}
          </table>
        ),
        th: ({ children }) => (
          <th className="text-base-black font-original border py-2 px-3 bg-base-white">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="text-base-black font-original border py-2 px-3">
            {children}
          </td>
        ),
        embed: ({ id, type }) => {
          if (!id || !type) {
            return null;
          }

          return (
            <div className="border border-dashed border-gray-400 p-4 rounded my-4">
              <p className="text-sm text-gray-500">{`Embed: ${id} (type: ${type})`}</p>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

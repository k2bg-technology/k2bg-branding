import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { codeToHtml } from 'shiki';
import { addCopyButton } from 'shiki-transformer-copy-button';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

import styles from './Root.module.css';

interface Props {
  content: string;
}

export async function Root(props: Props) {
  const { content } = props;

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => (
          <h1 {...props} className="text-heading-1 leading-heading-1 font-bold">
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            {...props}
            className="first:mt-0 mt-12 text-heading-2 leading-heading-2 font-bold"
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            {...props}
            className="first:mt-0 mt-8 text-heading-3 leading-heading-3 font-bold"
          >
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p
            {...props}
            className="first:mt-0 mt-4 text-body-r-md leading-body-r-md text-base-black text-justify"
          >
            {children}
          </p>
        ),
        a: ({ children, ...props }) => {
          const { href, className } = props;

          return (
            <Link
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
              {...props}
              className={className || 'mt-2 list-disc list-inside'}
            >
              {children}
            </ul>
          );
        },
        li: ({ children, ...props }) => {
          const { className } = props;

          return (
            <li
              {...props}
              className={
                className ||
                'text-body-r-md leading-body-r-md text-base-black text-justify'
              }
            >
              {children}
            </li>
          );
        },
        strong: ({ children, ...props }) => (
          <span {...props} className="mt-2 font-bold leading-none">
            {children}
          </span>
        ),
        pre: ({ children, ...props }) => (
          <pre {...props} className="first:mt-0 mt-2">
            {children}
          </pre>
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

                        // eslint-disable-next-line no-param-reassign
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
        blockquote: ({ children, ...props }) => (
          <blockquote
            {...props}
            className="first:mt-0 mt-2 border-l-4 border-slate-100 pl-2"
          >
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
        table: ({ children, ...props }) => (
          <table
            {...props}
            className="mt-4 w-full text-body-r-sm border-base-white"
          >
            {children}
          </table>
        ),
        th: ({ children, ...props }) => (
          <th
            {...props}
            className="text-base-black font-original border py-2 px-3 bg-base-white"
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td
            {...props}
            className="text-base-black font-original border py-2 px-3"
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

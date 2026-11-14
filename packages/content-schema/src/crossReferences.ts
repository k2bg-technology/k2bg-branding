import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { z } from 'zod';

import { AffiliateType, EmbedType, MediaType } from './enums';
import type { ContentBundle } from './schemas';

const embedTargets = {
  [EmbedType.AFFILIATE_PRODUCT]: {
    collection: 'affiliates',
    type: AffiliateType.PRODUCT,
  },
  [EmbedType.AFFILIATE_BANNER]: {
    collection: 'affiliates',
    type: AffiliateType.BANNER,
  },
  [EmbedType.AFFILIATE_TEXT]: {
    collection: 'affiliates',
    type: AffiliateType.TEXT,
  },
  [EmbedType.MEDIA_IMAGE]: { collection: 'media', type: MediaType.IMAGE },
  [EmbedType.MEDIA_VIDEO]: { collection: 'media', type: MediaType.VIDEO },
  [EmbedType.MEDIA_AUDIO]: null,
} as const;

// The same parser stack the blog renders with, so embed extraction matches what readers see.
const markdownParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective);

export function validateCrossReferences(
  bundle: ContentBundle,
  context: z.core.$RefinementCtx<ContentBundle>
): void {
  const report = (path: (string | number)[], message: string) => {
    context.addIssue({ code: 'custom', path, message });
  };

  const identifiers = new Set<string>();
  const items = [
    ...(['posts', 'pages', 'media', 'affiliates'] as const).flatMap(
      (collection) =>
        bundle[collection].map((item, index) => ({
          id: item.id,
          path: [collection, index, 'id'],
        }))
    ),
    ...Object.entries(bundle.authors).map(([key, author]) => ({
      id: author.id,
      path: ['authors', key, 'id'],
    })),
  ];
  for (const item of items) {
    if (identifiers.has(item.id)) {
      report(item.path, `Duplicate id "${item.id}"`);
    }
    identifiers.add(item.id);
  }

  const affiliates = new Map(
    bundle.affiliates.map((affiliate) => [affiliate.id, affiliate])
  );
  const media = new Map(bundle.media.map((item) => [item.id, item]));
  const slugs = new Set<string>();

  for (const collection of ['posts', 'pages'] as const) {
    bundle[collection].forEach((post, index) => {
      const path = [collection, index];
      if (slugs.has(post.slug)) {
        report([...path, 'slug'], `Duplicate slug "${post.slug}"`);
      }
      slugs.add(post.slug);

      if (
        post.author !== undefined &&
        !Object.hasOwn(bundle.authors, post.author)
      ) {
        report([...path, 'author'], `Unknown author key "${post.author}"`);
      }
      if (post.releaseDate > post.revisionDate) {
        report(
          [...path, 'revisionDate'],
          `revisionDate "${post.revisionDate}" precedes releaseDate "${post.releaseDate}"`
        );
      }

      visit(markdownParser.parse(post.content), 'leafDirective', (node) => {
        if (node.name !== 'embed') return;

        const { id, type } = node.attributes ?? {};
        if (!id || !type) {
          report(
            [...path, 'content'],
            'Embed requires both id and type attributes'
          );
          return;
        }
        const embedType = Object.values(EmbedType).find(
          (embedTypeValue) => embedTypeValue === type
        );
        if (!embedType) {
          report(
            [...path, 'content'],
            `Unknown embed type "${type}" for id "${id}"`
          );
          return;
        }
        const target = embedTargets[embedType];
        if (target === null) {
          report(
            [...path, 'content'],
            `MEDIA_AUDIO embed "${id}" has no supported media type`
          );
          return;
        }
        const item =
          target.collection === 'media' ? media.get(id) : affiliates.get(id);
        if (!item) {
          report(
            [...path, 'content'],
            `Embed id "${id}" is not found in ${target.collection}`
          );
        } else if (item.type !== target.type) {
          report(
            [...path, 'content'],
            `Embed "${id}" expects ${target.type}, received ${item.type}`
          );
        }
      });
    });
  }

  bundle.affiliates.forEach((affiliate, index) => {
    if (affiliate.type !== AffiliateType.PRODUCT) return;

    const subProviders = new Set<string>();
    affiliate.subProviders.forEach((id, subProviderIndex) => {
      const path = ['affiliates', index, 'subProviders', subProviderIndex];
      if (subProviders.has(id)) {
        report(path, `Duplicate sub-provider id "${id}"`);
      }
      subProviders.add(id);
      if (affiliates.get(id)?.type !== AffiliateType.SUB_PROVIDER) {
        report(
          path,
          `Sub-provider id "${id}" must resolve to a SUB_PROVIDER affiliate`
        );
      }
    });
  });
}

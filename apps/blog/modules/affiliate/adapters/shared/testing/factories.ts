import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type AffiliatePageType =
  | 'AFFILIATE_BANNER'
  | 'AFFILIATE_PRODUCT'
  | 'AFFILIATE_TEXT'
  | 'AFFILIATE_SUB_PROVIDER';

interface NotionAffiliatePageOverrides {
  id?: string;
  type?: AffiliatePageType;
  name?: string;
  targetUrl?: string;
  provider?: string;
  providerColor?: string;
  imageSourceUrl?: string;
  imageSourceFile?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageProvider?: string;
  subProviders?: string[];
}

function createTitleProperty(text: string) {
  return {
    type: 'title' as const,
    title: [
      {
        type: 'text' as const,
        plain_text: text,
        text: { content: text, link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default' as const,
        },
        href: null,
      },
    ],
    id: 'title',
  };
}

function createSelectProperty(name: string | null) {
  return {
    type: 'select' as const,
    select: name ? { name, id: 'select-id', color: 'default' as const } : null,
    id: 'select',
  };
}

function createUrlProperty(url: string | null) {
  return {
    type: 'url' as const,
    url,
    id: 'url',
  };
}

function createNumberProperty(value: number | null) {
  return {
    type: 'number' as const,
    number: value,
    id: 'number',
  };
}

function createFilesProperty(urls: string[]) {
  return {
    type: 'files' as const,
    files: urls.map((url) => ({
      type: 'file' as const,
      file: { url, expiry_time: '2099-01-01T00:00:00.000Z' },
      name: 'file',
    })),
    id: 'files',
  };
}

function createRelationProperty(ids: string[]) {
  return {
    type: 'relation' as const,
    relation: ids.map((id) => ({ id })),
    has_more: false,
    id: 'relation',
  };
}

function getTypeSpecificProperties(
  type: AffiliatePageType,
  overrides: NotionAffiliatePageOverrides
): Record<string, unknown> {
  switch (type) {
    case 'AFFILIATE_BANNER':
      return {
        imageSourceFile: createFilesProperty(
          overrides.imageSourceFile ? [overrides.imageSourceFile] : []
        ),
        imageSourceUrl: createUrlProperty(
          overrides.imageSourceUrl ?? 'https://example.com/banner.jpg'
        ),
        imageWidth: createNumberProperty(overrides.imageWidth ?? 300),
        imageHeight: createNumberProperty(overrides.imageHeight ?? 250),
      };
    case 'AFFILIATE_PRODUCT':
      return {
        providerColor: createSelectProperty(
          overrides.providerColor ?? '#FF9900'
        ),
        subProviders: createRelationProperty(overrides.subProviders ?? []),
        imageProvider: createSelectProperty(
          overrides.imageProvider ?? 'Amazon'
        ),
        imageSourceFile: createFilesProperty(
          overrides.imageSourceFile ? [overrides.imageSourceFile] : []
        ),
        imageSourceUrl: createUrlProperty(
          overrides.imageSourceUrl ?? 'https://example.com/product.jpg'
        ),
        imageWidth: createNumberProperty(overrides.imageWidth ?? 200),
        imageHeight: createNumberProperty(overrides.imageHeight ?? 200),
      };
    case 'AFFILIATE_SUB_PROVIDER':
      return {
        providerColor: createSelectProperty(
          overrides.providerColor ?? '#BF0000'
        ),
      };
    default:
      return {};
  }
}

/**
 * Creates a mock Notion Page Response for affiliate testing.
 */
export function createNotionAffiliatePageResponse(
  overrides: NotionAffiliatePageOverrides = {}
): PageObjectResponse {
  const type = overrides.type ?? 'AFFILIATE_BANNER';

  return {
    id: overrides.id ?? '550e8400-e29b-41d4-a716-446655440000',
    object: 'page',
    created_time: '2024-01-15T00:00:00.000Z',
    last_edited_time: '2024-01-15T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-id' },
    last_edited_by: { object: 'user', id: 'user-id' },
    cover: null,
    icon: null,
    parent: { type: 'database_id', database_id: 'database-id' },
    archived: false,
    in_trash: false,
    url: 'https://notion.so/page',
    public_url: null,
    properties: {
      name: createTitleProperty(overrides.name ?? 'Test Affiliate'),
      type: createSelectProperty(type),
      targetUrl: createUrlProperty(
        overrides.targetUrl ?? 'https://example.com/affiliate'
      ),
      provider: createSelectProperty(overrides.provider ?? 'Amazon'),
      ...getTypeSpecificProperties(type, overrides),
    },
  } as unknown as PageObjectResponse;
}

/**
 * Creates multiple Notion Page Responses for testing.
 */
export function createNotionAffiliatePageResponses(
  count: number,
  overrides: NotionAffiliatePageOverrides = {}
): PageObjectResponse[] {
  return Array.from({ length: count }, (_, index) =>
    createNotionAffiliatePageResponse({
      id: `550e8400-e29b-41d4-a716-44665544000${index}`,
      name: `Test Affiliate ${index}`,
      ...overrides,
    })
  );
}

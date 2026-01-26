import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type MediaPageType = 'MEDIA_IMAGE' | 'MEDIA_VIDEO';

interface NotionMediaPageOverrides {
  id?: string;
  type?: MediaPageType;
  name?: string;
  sourceFile?: string;
  sourceUrl?: string;
  targetUrl?: string;
  width?: number;
  height?: number;
  extension?: string;
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

function createRichTextProperty(text: string) {
  return {
    type: 'rich_text' as const,
    rich_text: text
      ? [
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
        ]
      : [],
    id: 'rich_text',
  };
}

/**
 * Creates a mock Notion Page Response for media testing.
 */
export function createNotionMediaPageResponse(
  overrides: NotionMediaPageOverrides = {}
): PageObjectResponse {
  const type = overrides.type ?? 'MEDIA_IMAGE';

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
      name: createTitleProperty(overrides.name ?? 'Test Media'),
      type: createSelectProperty(type),
      sourceFile: createFilesProperty(
        overrides.sourceFile ? [overrides.sourceFile] : []
      ),
      sourceUrl: createUrlProperty(
        overrides.sourceUrl ?? 'https://example.com/media.jpg'
      ),
      targetUrl: createUrlProperty(overrides.targetUrl ?? null),
      width: createNumberProperty(overrides.width ?? 800),
      height: createNumberProperty(overrides.height ?? 600),
      extension: createRichTextProperty(overrides.extension ?? 'jpg'),
    },
  } as unknown as PageObjectResponse;
}

/**
 * Creates multiple Notion Page Responses for testing.
 */
export function createNotionMediaPageResponses(
  count: number,
  overrides: NotionMediaPageOverrides = {}
): PageObjectResponse[] {
  return Array.from({ length: count }, (_, index) =>
    createNotionMediaPageResponse({
      id: `550e8400-e29b-41d4-a716-44665544000${index}`,
      name: `Test Media ${index}`,
      ...overrides,
    })
  );
}

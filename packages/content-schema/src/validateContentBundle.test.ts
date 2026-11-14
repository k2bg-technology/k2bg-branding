import { describe, expect, it } from 'vitest';

import { type ContentBundle, type Post, validateContentBundle } from './index';

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    title: 'A sample article',
    type: 'ARTICLE',
    status: 'IDEA',
    slug: 'sample-article',
    excerpt: 'An article excerpt',
    category: 'ENGINEERING',
    tags: ['typescript'],
    releaseDate: '2024-02-29',
    revisionDate: '2024-03-01',
    heroImage: 'https://example.com/hero.jpg',
    content: '# Sample article',
    createdAt: '2024-02-29T10:00:00+09:00',
    updatedAt: '2024-03-01T01:00:00Z',
    ...overrides,
  };
}

function createBundle(): ContentBundle {
  return {
    formatVersion: 1,
    locale: 'ja',
    posts: [
      createPost({
        author: 'sample-author',
        content: [
          '::embed{id="dddddddd-dddd-dddd-dddd-ddddddddddd1" type="AFFILIATE_PRODUCT"}',
          '::embed{id=dddddddd-dddd-dddd-dddd-ddddddddddd2 type=AFFILIATE_BANNER}   ',
          '::embed{type=AFFILIATE_TEXT id=dddddddd-dddd-dddd-dddd-ddddddddddd3}',
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc1 type=MEDIA_IMAGE}',
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc2 type=MEDIA_VIDEO}',
        ].join('\n'),
      }),
      createPost({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        slug: 'design',
        status: 'DRAFT',
        category: 'DESIGN',
      }),
      createPost({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        slug: 'data-science',
        status: 'PREVIEW',
        category: 'DATA_SCIENCE',
      }),
      createPost({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        slug: 'life-style',
        status: 'PUBLISHED',
        category: 'LIFE_STYLE',
      }),
      createPost({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
        slug: 'other',
        status: 'ARCHIVED',
        category: 'OTHER',
      }),
    ],
    pages: [
      createPost({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
        slug: 'about',
        type: 'PAGE',
      }),
    ],
    media: [
      {
        id: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
        type: 'IMAGE',
        name: 'Sample image',
        sourceFile: 'https://example.com/image.png',
        width: 640,
        height: 480,
        extension: 'png',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
        type: 'VIDEO',
        name: 'Sample video',
        sourceUrl: 'https://example.com/video.mp4',
        targetUrl: 'https://example.com/video',
        width: 1920,
        height: 1080,
        extension: 'mp4',
      },
    ],
    affiliates: [
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddddd1',
        type: 'PRODUCT',
        name: 'Sample product',
        targetUrl: 'https://example.com/product',
        provider: 'Sample provider',
        image: {
          src: 'https://example.com/product.jpg',
          width: 300,
          height: 200,
        },
        providerColor: '#AbC',
        imageProvider: 'Sample images',
        subProviders: ['dddddddd-dddd-dddd-dddd-ddddddddddd4'],
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddddd2',
        type: 'BANNER',
        name: 'Sample banner',
        targetUrl: 'https://example.com/banner',
        provider: 'Sample provider',
        image: {
          src: 'https://example.com/banner.jpg',
          width: 600,
          height: 200,
        },
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddddd3',
        type: 'TEXT',
        name: 'Sample text link',
        targetUrl: 'https://example.com/text',
        provider: 'Sample provider',
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddddd4',
        type: 'SUB_PROVIDER',
        name: 'Sample sub-provider',
        targetUrl: 'https://example.com/sub-provider',
        provider: 'Another provider',
        providerColor: '#123aBc',
      },
    ],
    authors: {
      'sample-author': {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
        name: 'Sample Author',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    },
  };
}

describe('validateContentBundle', () => {
  it('accepts a representative bundle using every supported enum value and returns its content', () => {
    const sut = validateContentBundle;
    const bundle = createBundle();

    const result = sut(bundle);

    expect(result).toEqual({ success: true, bundle });
  });

  it.each<{
    scenario: string;
    change: (bundle: ContentBundle) => unknown;
    item: string;
    field: string;
    message?: string;
  }>([
    {
      scenario: 'an unknown key',
      change: (bundle) => ({ ...bundle, unexpected: true }),
      item: 'bundle',
      field: 'unexpected',
    },
    {
      scenario: 'format version 2',
      change: (bundle) => ({ ...bundle, formatVersion: 2 }),
      item: 'bundle',
      field: 'formatVersion',
    },
    {
      scenario: 'an English locale',
      change: (bundle) => ({ ...bundle, locale: 'en' }),
      item: 'bundle',
      field: 'locale',
    },
    {
      scenario: 'an id duplicated across collections',
      change: (bundle) => {
        bundle.media[0].id = bundle.posts[0].id;
      },
      item: 'media/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'id',
    },
    {
      scenario: 'a slug shared by a post and a page',
      change: (bundle) => {
        bundle.pages[0].slug = bundle.posts[0].slug;
      },
      item: 'pages/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      field: 'slug',
    },
    {
      scenario: 'a missing embed target',
      change: (bundle) => {
        bundle.posts[0].content =
          '::embed{id=ffffffff-ffff-ffff-ffff-fffffffffff1 type=MEDIA_IMAGE}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
      message: 'ffffffff-ffff-ffff-ffff-fffffffffff1',
    },
    {
      scenario: 'a missing embed target after a line of inline code',
      change: (bundle) => {
        bundle.posts[0].content = [
          '```const message = `hello`;```',
          '',
          '::embed{id=ffffffff-ffff-ffff-ffff-fffffffffff1 type=MEDIA_IMAGE}',
        ].join('\n');
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
      message: 'ffffffff-ffff-ffff-ffff-fffffffffff1',
    },
    {
      scenario: 'a missing embed target after a fenced code block in a list',
      change: (bundle) => {
        bundle.posts[0].content = [
          '- ```js',
          '  const value = 1;',
          '  ```',
          '',
          '::embed{id=ffffffff-ffff-ffff-ffff-fffffffffff1 type=MEDIA_IMAGE}',
        ].join('\n');
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
      message: 'ffffffff-ffff-ffff-ffff-fffffffffff1',
    },
    {
      scenario: 'an embed type mismatch',
      change: (bundle) => {
        bundle.posts[0].content =
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc1 type=MEDIA_VIDEO}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
    },
    {
      scenario: 'a MEDIA_AUDIO embed',
      change: (bundle) => {
        bundle.posts[0].content =
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc2 type=MEDIA_AUDIO}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
    },
    {
      scenario: 'an embed without an id',
      change: (bundle) => {
        bundle.posts[0].content = '::embed{type=MEDIA_IMAGE}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
    },
    {
      scenario: 'an embed without a type',
      change: (bundle) => {
        bundle.posts[0].content =
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc1}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
    },
    {
      scenario: 'an unknown embed type',
      change: (bundle) => {
        bundle.posts[0].content =
          '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc1 type=UNKNOWN}';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'content',
    },
    {
      scenario: 'a sub-provider reference to a text affiliate',
      change: (bundle) => {
        if (bundle.affiliates[0].type === 'PRODUCT')
          bundle.affiliates[0].subProviders = [
            'dddddddd-dddd-dddd-dddd-ddddddddddd3',
          ];
      },
      item: 'affiliates/dddddddd-dddd-dddd-dddd-ddddddddddd1',
      field: 'subProviders.0',
    },
    {
      scenario: 'a duplicate sub-provider reference',
      change: (bundle) => {
        if (bundle.affiliates[0].type === 'PRODUCT')
          bundle.affiliates[0].subProviders.push(
            'dddddddd-dddd-dddd-dddd-ddddddddddd4'
          );
      },
      item: 'affiliates/dddddddd-dddd-dddd-dddd-ddddddddddd1',
      field: 'subProviders.1',
    },
    {
      scenario: 'an unknown author key',
      change: (bundle) => {
        bundle.posts[0].author = 'missing-author';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'author',
    },
    {
      scenario: 'a release date after the revision date',
      change: (bundle) => {
        bundle.posts[0].releaseDate = '2024-03-02';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'revisionDate',
    },
    {
      scenario: 'media without either source',
      change: (bundle) => {
        delete bundle.media[0].sourceFile;
      },
      item: 'media/cccccccc-cccc-cccc-cccc-ccccccccccc1',
      field: 'sourceUrl',
      message: 'sourceFile or sourceUrl',
    },
    {
      scenario: 'a PAGE inside posts',
      change: (bundle) => {
        bundle.posts[0].type = 'PAGE';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'type',
    },
    {
      scenario: 'an uppercase UUID',
      change: (bundle) => {
        bundle.posts[0].id = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAA1';
      },
      item: 'posts/AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAA1',
      field: 'id',
    },
    {
      scenario: 'an unreadable id',
      change: (bundle) => ({
        ...bundle,
        posts: [{ ...bundle.posts[0], id: 42 }],
      }),
      item: 'posts[0]',
      field: 'id',
    },
    {
      scenario: 'an invalid nested image width',
      change: (bundle) => {
        if (bundle.affiliates[0].type === 'PRODUCT')
          bundle.affiliates[0].image.width = 0;
      },
      item: 'affiliates/dddddddd-dddd-dddd-dddd-ddddddddddd1',
      field: 'image.width',
    },
    {
      scenario: 'an invalid calendar date',
      change: (bundle) => {
        bundle.posts[0].releaseDate = '2023-02-29';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'releaseDate',
    },
    {
      scenario: 'a datetime without an offset',
      change: (bundle) => {
        bundle.posts[0].createdAt = '2024-02-29T10:00:00';
      },
      item: 'posts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      field: 'createdAt',
    },
    {
      scenario: 'an author id duplicated from a post',
      change: (bundle) => {
        bundle.authors['sample-author'].id = bundle.posts[0].id;
      },
      item: 'authors/sample-author',
      field: 'id',
    },
  ])(
    'rejects $scenario and identifies its item and field',
    ({ change, item, field, message }) => {
      const sut = validateContentBundle;
      const bundle = createBundle();
      const input = change(bundle) ?? bundle;

      const result = sut(input);

      expect(result).toEqual({
        success: false,
        issues: expect.arrayContaining([
          {
            item,
            field,
            message: message
              ? expect.stringContaining(message)
              : expect.any(String),
          },
        ]),
      });
    }
  );

  it.each(['```', '~~~'])(
    'ignores embeds inside a %s fenced code block and resumes after it',
    (fence) => {
      const sut = validateContentBundle;
      const bundle = createBundle();
      bundle.posts[0].content = [
        `${fence}markdown`,
        '::embed{type=UNKNOWN}',
        fence,
        '::embed{id=cccccccc-cccc-cccc-cccc-ccccccccccc1 type=MEDIA_IMAGE}',
      ].join('\n');

      const result = sut(bundle);

      expect(result).toEqual({ success: true, bundle });
    }
  );
});

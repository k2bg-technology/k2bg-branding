# Content Schema

## Purpose

`content-schema` defines the content bundle contract between the blog API and a
client that builds bundles. It exports Zod schemas, inferred TypeScript types,
const-object enums, `CONTENT_BUNDLE_FORMAT_VERSION`, and `validateContentBundle`.
Validation is pure: the package performs no filesystem, network, or database I/O
and uses no Node-only APIs.

## Installation

Install a published GitHub Release tarball, replacing `<version>` with the package
version:

```sh
pnpm add 'https://github.com/k2bg-technology/k2bg-branding/releases/download/content-schema@<version>/content-schema-<version>.tgz'
```

The package is private in the workspace and is distributed through GitHub Releases.
Its ESM entry point and TypeScript declarations reside in `dist`.

## Usage

```typescript
import { validateContentBundle } from 'content-schema';

const input: unknown = {
  formatVersion: 1,
  locale: 'ja',
  posts: [],
  pages: [],
  media: [],
  affiliates: [],
  authors: {},
};

const result = validateContentBundle(input);
if (result.success) {
  console.log(result.bundle);
} else {
  for (const issue of result.issues) {
    console.error(`${issue.item} ${issue.field}: ${issue.message}`);
  }
}
```

`contentBundleSchema` exports the same schema with cross-reference validation for
callers that compose Zod schemas. Item schemas (`postSchema`, `mediaSchema`,
`affiliateSchema`, `authorSchema`, `authorsSchema`) and enum schemas are also public.
Inferred item types are `Post`, `Media`, `Affiliate`, `Author`, and `Authors`; the
bundle type is `ContentBundle`.

## Bundle Format

Every object is strict: unknown keys are rejected, including nested image and
author objects. All listed fields are required unless marked optional. IDs use
lowercase canonical UUID text:
`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`. Every URL field
accepts only `https:` URLs.

### Top-level fields

| Field | Value |
| --- | --- |
| `formatVersion` | `1` |
| `locale` | `ja` |
| `posts` | Array of posts with `type: ARTICLE` |
| `pages` | Array of posts with `type: PAGE` |
| `media` | Array of media items |
| `affiliates` | Array of affiliates |
| `authors` | Record of author keys to author objects |

### Posts and pages

| Field | Constraint |
| --- | --- |
| `id` | UUID |
| `title` | Non-empty string, at most 100 characters |
| `type` | `ARTICLE` or `PAGE`, matching the collection |
| `status` | `IDEA`, `DRAFT`, `PREVIEW`, `PUBLISHED`, or `ARCHIVED` |
| `slug` | At most 100 characters, matching `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `excerpt` | String, at most 500 characters |
| `category` | `ENGINEERING`, `DESIGN`, `DATA_SCIENCE`, `LIFE_STYLE`, or `OTHER` |
| `tags` | At most 20 strings, each non-empty and at most 10 characters |
| `author` | Optional key into `authors` |
| `releaseDate`, `revisionDate` | Valid calendar dates in `YYYY-MM-DD` format |
| `heroImage` | Optional URL |
| `content` | Markdown body string |
| `createdAt`, `updatedAt` | ISO 8601 datetimes with a timezone offset or `Z` |

### Media

| Field | Constraint |
| --- | --- |
| `id` | UUID |
| `type` | `IMAGE` or `VIDEO` |
| `name` | Non-empty string |
| `sourceFile`, `sourceUrl` | Optional URLs; at least one is required |
| `targetUrl` | Optional URL |
| `width`, `height` | Positive integers |
| `extension` | Optional: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `bmp`, `ico`, `avif`, `mp4`, `webm`, `ogg`, `mov`, or `avi` |

Missing media sources produce an issue on `sourceUrl` naming both source fields.

### Affiliates

All affiliates have `id` (UUID), `name` (non-empty string), `targetUrl` (URL),
`provider` (non-empty string, at most 50 characters), and the `type` discriminator.

| Type | Additional required fields |
| --- | --- |
| `BANNER` | `image` |
| `PRODUCT` | `image`, `providerColor`, `imageProvider`, `subProviders` |
| `TEXT` | None |
| `SUB_PROVIDER` | `providerColor` |

`image` contains `src` (URL), `width`, and `height` (positive integers).
`providerColor` is hex `#RGB` or `#RRGGBB`. `imageProvider` is a non-empty string of
at most 50 characters. `subProviders` is an array of UUIDs.

### Authors

Author keys are non-empty and match `^[a-z0-9]+(-[a-z0-9]+)*$`. Each author contains
`id` (UUID), `name` (non-empty string), and optional `avatarUrl` (URL).

### Embeds

An embed is a `::embed{...}` leaf directive. Content is parsed with the same Markdown
parser stack the blog renders with (CommonMark, GFM, and the generic directive syntax),
so an embed is checked exactly when the blog would render it:

```markdown
::embed{id="cccccccc-cccc-cccc-cccc-ccccccccccc1" type="MEDIA_IMAGE"}
```

| Embed type | Referenced collection and type |
| --- | --- |
| `AFFILIATE_PRODUCT` | `affiliates`, `PRODUCT` |
| `AFFILIATE_BANNER` | `affiliates`, `BANNER` |
| `AFFILIATE_TEXT` | `affiliates`, `TEXT` |
| `MEDIA_IMAGE` | `media`, `IMAGE` |
| `MEDIA_VIDEO` | `media`, `VIDEO` |
| `MEDIA_AUDIO` | Always rejected; no supported media type matches |

Every embed requires `id` and `type`. Unknown types, missing targets, and type
mismatches are rejected. Directive text inside code (fenced, indented, or inline) is
not an embed and is ignored.

### Cross-reference rules

- IDs are unique across posts, pages, media, affiliates, and all author IDs.
- Slugs are unique across posts and pages together.
- Embed references resolve with the types in the table above.
- Each product's `subProviders` resolves to `SUB_PROVIDER` affiliates, without
  duplicate IDs in the list.
- A post or page's `author`, when present, names an author key.
- `releaseDate` is no later than `revisionDate`.

### Validation issues

`validateContentBundle(input: unknown)` returns either
`{ success: true, bundle: ContentBundle }` or
`{ success: false, issues: ContentBundleIssue[] }`.
Each issue has the same shape for Zod errors and cross-reference errors:

```typescript
type ContentBundleIssue = {
  item: string;
  field: string;
  message: string;
};
```

`item` is `posts/<id>`, `pages/<id>`, `media/<id>`, `affiliates/<id>`, or
`authors/<key>`. An unreadable item ID uses an indexed fallback such as `posts[3]`.
Top-level errors use `bundle`. `field` is the dotted path inside the item, such as
`slug`, `content`, `image.width`, or `subProviders.1`; an error on the item itself
has an empty field. Messages are English and identify offending references where
useful.

## Versioning

A bundle format change bumps `formatVersion`. The API first accepts both the old
and new formats, the client then moves to the new format, and the API then drops
the old format.

Package semver and `formatVersion` are separate. An incompatible change to the set
of accepted format versions requires a package major version bump.

## Release

The release process consists of a package version bump in a pull request, merge
into `main`, and an owner-created `content-schema@<version>` tag on `main`. Only the
owner creates these tags. The release workflow checks that the tag matches
`package.json`, runs the tests and build, packs and checks the tarball, and creates
the GitHub Release with `content-schema-<version>.tgz` attached.

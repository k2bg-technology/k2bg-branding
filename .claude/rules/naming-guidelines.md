---
paths: apps/**/*.{ts,tsx,mts,mjs}, packages/**/*.{ts,tsx,mts,mjs}
---

# Naming Guidelines

One name per concept, written the same way everywhere. These rules record the conventions
the code already follows in the majority of cases; where the code was split, the rule picks
the majority form. `.claude/rules/code-style.md` covers intent and readability; this file
covers spelling.

> **Scope note:** these are target conventions for new and changed code. Existing
> violations are tracked in dedicated issues — do NOT rename them as part of unrelated
> changes.

## Identifier Casing

| Kind | Casing | Example |
| --- | --- | --- |
| Components, classes, interfaces, type aliases, const-assertion enum objects | PascalCase | `Header`, `DrizzlePostRepository`, `PostOutput`, `Category` |
| Functions, variables, parameters, props, object keys | camelCase | `resolveLanguage`, `postSummaries`, `showLegend` |
| Module-level literal constants (strings, numbers, tuples, shader source) | UPPER_SNAKE_CASE | `BLOG_SITE_NAME`, `CHART_PALETTE_SIZE` |
| Acronyms inside any identifier | first letter only | `ImageUrl`, `PostId`, `getOgImageUrl`, `SnsShareButton`, `HudOverlay` — never `imageURL`, `postID` |

- A const-assertion enum object and its derived type share one PascalCase name
  (`export const Category = {...} as const; export type Category = ...`); members are
  UPPER_SNAKE_CASE (`Category.ENGINEERING`).
- A module-level constant that holds a computed object or a schema is camelCase
  (`postSchema`, `buttonVariants`), not UPPER_SNAKE_CASE.

## Words

- Write full words. `dictionary` not `dict`, `language` not `lang`, `error` not `err`,
  `response` not `res`, `index` not `idx`, `value` not `val`, `event` not `e`.
- Accepted short names: `id`, `url`, `db` (a Drizzle client), `x` / `y` / `width` / `height`
  for coordinates and sizes, `i18n` as the directory and module name.
- A Next.js route parameter keeps its segment name at the receiving line only
  (`const { lang } = await params;`) and is normalized at once
  (`const language = resolveLanguage(lang);`). Nothing else is named `lang`.
- Catch clauses bind `error` (`catch (error)`); rethrown or wrapped errors pass it as `cause`.

## Booleans

- Local variables, derived values, and functions use `is` / `has` / `can` / `should`
  (`isVisible`, `hasNextPage`, `canPublish`).
- Props follow the HTML and React convention: a state adjective or participle without a
  prefix (`disabled`, `open`, `stacked`, `animated`, `truncated`) or `show<Thing>` for an
  optional part (`showLegend`). A prop that is forwarded to a DOM attribute keeps the
  attribute's name.
- No negative names in either place: `enabled` not `disableSync`, `visible` not
  `hideLabel`. Biome rule identifiers (`noLet`) are not identifiers of this repository.

## Function Verbs

| Prefix | Meaning | Example |
| --- | --- | --- |
| `get` | returns a value for its arguments without I/O, or reads a static or cached source | `getCategoryDisplayName`, `getDictionary` (static JSON), `getDrizzleClient` (singleton) |
| `fetch` | reads from a remote service or a database and may fail | `fetchPostSummaries`, `FetchPost` |
| `load` | reads definition or configuration files | `LoadDashboards` |
| `resolve` | derives one value from context, parameters, or a fallback chain | `resolveLanguage`, `ResolveDashboardPeriod` |
| `create` | constructs an object or a wired use case | `createFetchPostUseCase`, `createDrizzleClient` |
| `build` | assembles a query or a composite value from parts | `buildSectionQuery` |
| `to<Type>` | maps one shape to another | `toPostOutput`, `toDomain`, `toPersistence` |
| `format` / `parse` | string ↔ value | `formatTimestamp`, `parseCalendarDate` |
| `sync` / `revalidate` / `send` / `upload` | an external effect | `SyncHeroImages`, `revalidateBlogPages`, `SendEmail`, `uploadFile` |
| `use` | a React hook | `useSnsShareInfo` |
| `handle<Event>` | an event handler defined inside a component | `handleSearch`, `handleScroll` |
| `on<Event>` | a callback prop | `onSuccess`, `onOpenChange` |

A verb says what the caller gets; `get` never hides a network call.

## Components

- The file exports one component with the file's name: `Header.tsx` exports `Header`. A
  file that holds several small parts of one visual effect (`CrtEffects.tsx`) is the
  exception and names the effect.
- Components are named exports. `export default` is used only where a framework requires
  it: Next.js route files (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`),
  Storybook meta, Remotion's root, and config files.
- The main props type of a file is `Props`, as `interface Props` when it declares an object
  or extends another type, as `type Props` when it aliases or intersects existing types.
  A props type that a package exports for consumers is `<Component>Props`
  (`BarChartProps`, `DataTableProps` in `packages/ui`); the component still reads it under
  that name. Secondary parts in the same file use `<Part>Props`.
- Compound components attach parts with dot notation and set
  `displayName = '<Parent>.<Part>'` on every part (canonical:
  `packages/ui/src/components/Table/Cell.tsx`); a standalone component sets its own name.
- Skeleton, empty, and unavailable states are `<Component>Skeleton`, `<Component>Empty`,
  `<Component>Unavailable`.
- Story files are `<Component>.stories.tsx`. `packages/ui` stories omit `title` (Storybook
  derives it from the path); app stories set `title` explicitly.

## Hooks

- A hook is `use<Thing>` in a file of the same name with the `.ts` extension; use `.tsx`
  only when the file contains JSX. A hook specific to one component lives in that
  component's directory (`apps/blog/components/sns-share-button/useSnsShareInfo.ts`);
  a Zustand store hook is `use<Thing>Store`.

## Clean Architecture Names

| Unit | Class or type | File | Example |
| --- | --- | --- | --- |
| Entity | domain noun | camelCase of the class | `Contact` in `apps/blog/modules/contact/domain/entities/contact.ts` |
| Value object | domain noun | camelCase of the class | `Slug` in `apps/blog/modules/post/domain/value-objects/slug.ts` |
| Domain error | `Invalid<Field>Error`, `<Rule>Error`, base `DomainError` | `errors.ts` | `InvalidSlugError`, `PostAlreadyPublishedError` |
| Use case | verb phrase, no suffix | `useCase.ts` in `use-cases/<kind>/<verb-phrase>/` | `FetchPost` in `apps/blog/modules/post/use-cases/query/fetch-post/useCase.ts` |
| Use-case error | `<Thing>NotFoundError`, `Invalid<Input>Error`, base `UseCaseError` | `use-cases/shared/errors.ts` | `PostNotFoundError` |
| Port (interface) | role noun | camelCase of the interface | `EmailSender` in `apps/blog/modules/contact/domain/repositories/emailSender.ts` |
| Repository adapter | `<Technology><Aggregate>Repository` | camelCase without the technology, inside `<technology>/` | `DrizzlePostRepository` in `apps/blog/modules/post/adapters/output/repositories/drizzle/postRepository.ts` |
| Query service adapter | `<Technology><UseCase>QueryService` | camelCase without the technology | `DrizzleFetchPostQueryService` in `apps/blog/modules/post/adapters/output/query-services/drizzle/fetchPostQueryService.ts` |
| Other adapter | `<Technology><Role>` | camelCase of the role, without the technology | `NotionExternalPostSource` in `apps/blog/modules/post/adapters/output/external-sources/notion/externalPostSource.ts` |
| Adapter error | `RepositoryError`, `ExternalSourceError`, `MappingError` | `adapters/shared/errors.ts` | — |
| Mapper | `toDomain` / `toPersistence` / `to<Output>` | `mapper.ts`, `<entity>OutputMapper.ts` | `toPostOutput` |
| DI factory | `create<UseCase>UseCase` | `infrastructure/di/<module>.ts` | `createFetchPostUseCase` in `apps/blog/infrastructure/di/post.ts` |
| Zod schema (domain, definitions, forms) | camelCase `<thing>Schema` | — | `dashboardDefinitionSchema` |
| Zod schema (Hono server) | PascalCase `<Thing>RequestSchema` / `<Thing>ResponseSchema` | `apps/blog/server/schemas/` | `SyncPostsResponseSchema` |

The technology lives in the class name and the directory name, not in the file name. The
module's error base is always `DomainError`, never `<Module>DomainError`.

## Files and Directories

| Item | Casing | Example |
| --- | --- | --- |
| Component, story, and component test | PascalCase, test and story carry the component's name | `Header.tsx`, `Header.stories.tsx`, `Header.test.tsx` |
| Hook, utility, domain, adapter, server files and their tests | camelCase, the test carries the source file's name | `useSnsShareInfo.ts`, `useSnsShareInfo.test.ts`, `slug.ts`, `slug.test.ts` |
| Next.js route files and framework config | lowercase as the framework names them | `page.tsx`, `not-found.tsx`, `middleware.ts`, `next.config.mjs`, `image-loader.ts` |
| Barrel | `index.ts`, or `index.tsx` when it assembles a compound component | `packages/ui/src/components/Table/index.tsx` |
| Directories in apps (components, modules, layers, use cases) | kebab-case | `components/article-heading/`, `use-cases/query/fetch-post/`, `query-services/` |
| Component directories in `packages/ui` and Scene Studio primitives, patterns, compositions | PascalCase | `packages/ui/src/components/Avatar/`, `apps/scene-studio/src/primitives/Caption/` |
| `packages/ui` `*.module.css` class keys | lowerCamelCase | — |

- A test is the source file name plus `.test` (or `.spec`) before the extension. A middle
  segment names a separate Vitest project or a deliberately split suite:
  `postRepository.db.test.ts` for database integration tests,
  `chartTicks.contracts.test.ts` for a contract suite.
- An app component directory is a feature unit: the main component, its parts, skeleton,
  hooks, and tests share one kebab-case directory (`apps/blog/components/sns-share-button/`).
  Components never sit directly in `components/` or in a route directory under `app/`.
- Scene Studio composition IDs are kebab-case; primitive, pattern, and composition names
  follow `.claude/rules/remotion-template-guidelines.md`.

# Repository Guidelines

This file is the **single source of truth** for all AI agents (Codex, Claude Code, GitHub
Copilot) and human contributors working in this repository. Codex and Copilot read
`AGENTS.md` natively; `CLAUDE.md` imports it. Keep shared rules here — do not duplicate
them in other files.

When a product, design, or writing decision is ambiguous and no rule below settles it,
consult the `k2bg-principles` skill — the brand's decision-making principles (feature
selection, engineering trade-offs, writing tone).

## Project Structure & Module Organization

- Monorepo managed by pnpm workspaces and Turborepo.
- Apps: `apps/blog` (Next.js + Drizzle ORM + Hono API server, port 3000),
  `apps/portfolio` (Next.js, multilingual, port 3001), and `apps/scene-studio`
  (Remotion Studio for programmatic short-form videos, port 3002).
- Packages: `packages/ui` (shared React components + Storybook), `packages/test-utils`
  (Vitest helpers), `packages/tailwind-config` (design tokens), `packages/biome-config`,
  `packages/tsconfig`.
- CI, templates, and bots live under `.github/`. See `.github/PULL_REQUEST_TEMPLATE.md`.
- Tech stack: Next.js 16 (Turbopack, React Compiler), TypeScript (strict, 100%),
  Tailwind CSS v4, Turborepo, pnpm 10+.

## Build, Test, and Development Commands

- Install: `pnpm install` (pnpm 10+, Node 20.9+).
- Develop all: `pnpm dev` (runs `turbo run dev`); filter: `pnpm -F blog dev` / `pnpm -F portfolio dev`.
- Build: `pnpm build`; Start: `pnpm start` (per app/package via filter as above).
- Lint/Types/Format: `pnpm lint` (Biome), `pnpm typecheck`, `pnpm format` (Biome).
- Test: `pnpm test` or `pnpm test:watch` (Vitest in Blog and Test Utils).
- Component scaffolding: `pnpm generate:component`, `pnpm generate:style`.
- Storybook (UI): `pnpm -F ui storybook` (port 6006); Chromatic via CI.
- Video (Scene Studio): `pnpm -F scene-studio dev` (Remotion Studio, port 3002);
  render locally via `pnpm -F scene-studio render <composition-id>`.

## Architecture

### Blog App — Clean Architecture

The blog follows Clean Architecture with vertical slicing by domain module. Each module
(`post`, `contact`, `media`, `affiliate`, `social-feed`) contains three layers:

```
modules/<module>/
├── domain/      # Entities, value objects, repository interfaces (ports), errors
├── use-cases/   # Application business rules (query / command / sync)
└── adapters/    # Infrastructure (Notion, Drizzle, Cloudinary, AWS SES, Instagram)
```

Respect dependency direction: `domain` ← `use-cases` ← `adapters`. Never let inner layers
depend on outer ones. See the `clean-architecture-guidelines` skill for details.

Repository and Entity patterns:

```typescript
export class PostRepository {
  async findById(id: string): Promise<Post | null> {
    // Implementation
  }
}

export class PostEntity {
  constructor(private readonly post: PostData) {}
  toObject(): Post {
    return { id: this.post.id, title: this.post.title /* ... */ };
  }
}
```

### Blog App — Hono API Server

A Hono-based REST API is integrated into Next.js via a catch-all route handler
(`app/api/[[...route]]/route.ts`).

- Framework: [Hono](https://hono.dev/) with `OpenAPIHono` for type-safe definitions.
- OpenAPI spec at `/api/doc.json` and Swagger UI at `/api/doc` (non-production only).
- Auth: API key via `x-api-key` header.
- Structure: `server/app.ts` (app setup/routing), `server/routes/` (`createRoute()` + OpenAPI
  metadata), `server/schemas/` (Zod request/response), `server/middleware/` (apiKeyAuth,
  errorHandler, requestLogger).
- Detailed conventions: `.claude/rules/hono-api-guidelines.md` (Claude Code auto-loads it;
  other agents can read it directly).

### Portfolio App

- Server-only dictionary-based internationalization (Japanese/English) — no react-i18next.
  Detailed conventions: `.claude/rules/portfolio-i18n-guidelines.md`.
- Middleware-based language detection and routing (`apps/portfolio/middleware.ts`); dynamic
  language routing with Next.js (`app/[lang]/`).
- Next.js 16 renamed `middleware.ts` to `proxy.ts`, but the portfolio deliberately keeps
  `middleware.ts` because i18n locale detection requires the edge runtime — do not rename it.
  Use `proxy.ts` only when adding new middleware to the blog app.

### Scene Studio (Video Generation)

- `apps/scene-studio` renders short-form vertical videos (1080×1920) with
  [Remotion](https://www.remotion.dev/): compositions are React components driven by
  props/JSON, styled with Tailwind v4 reusing `packages/tailwind-config` tokens.
- Animations must be deterministic: derive all state from `useCurrentFrame()` and props —
  never `requestAnimationFrame`, unseeded randomness, or the current time.
- Media assets are never committed; `apps/scene-studio/public/assets/` is gitignored
  (reference files via `staticFile()`). Rendering is local-macOS-only for now (brand
  system fonts are unavailable on Linux/CI).
- All `remotion` / `@remotion/*` packages stay on one identical exact-pinned version;
  bump them together in a single commit.
- Template/composition design and naming (three-layer structure, no universal
  templates): `.claude/rules/remotion-template-guidelines.md`.

### Key Integrations

- **Notion API** — content management and blog posts.
- **Drizzle ORM + PostgreSQL** — database access and persistence.
- **Cloudinary** — image optimization and CDN (use Next.js `Image` for rendering).
- **AWS SES** — email service for contact forms.
- **Hono** — lightweight REST API framework with OpenAPI support.

## Database (Blog App) — Drizzle

- Use **Drizzle ORM** (`drizzle-orm` / `drizzle-kit`) for database operations.
- Schema lives in `apps/blog/infrastructure/drizzle/schema.ts`; migrations in
  `apps/blog/infrastructure/drizzle/migrations/`; config in `apps/blog/drizzle.config.ts`.
- Repositories and query services receive the client (`getDrizzleClient()` from
  `apps/blog/infrastructure/drizzle/client.ts`) via constructor injection — never create
  ad-hoc connections.
- Commands (`pnpm -F blog ...`): `db:up` (local Postgres via Docker), `db:migrate` (apply
  migrations), `db:pull` / `db:generate` / `db:check` (drizzle-kit), `db:verify`
  (full round-trip against a disposable Postgres).
- Schema change workflow: edit `schema.ts` → `db:generate` → review the SQL → `db:migrate`;
  run `db:verify` before pushing.
- Do not run destructive migration commands against production; run production migrations
  only after the PR is merged, with a backup taken first.
- Never run `db:up` / docker compose from a git worktree — the relative bind mount forks
  the Postgres data directory and the dev DB appears wiped.
- Detailed persistence conventions (schema, client, repositories vs. query services,
  transactions, mapping): `.claude/rules/drizzle-guidelines.md`.

## Coding Style & Naming Conventions

- Biome enforced (`biome.jsonc`); TypeScript strict across the repo (shared `packages/tsconfig`).
- Prefer full, descriptive identifiers — avoid abbreviations (`dictionary` not `dict`,
  `language` not `lang`).

### File & Directory Naming

- React components: **PascalCase** (`Header.tsx`, `ArticleHeading.tsx`).
- Component stories: **PascalCase** `.stories.tsx` (`Button.stories.tsx`).
- Tests: **camelCase** `.test.ts(x)` / `.spec.ts(x)` (`useSnsShareInfo.test.ts`).
- Utility files: **camelCase** (`generateHtmlTemplate.ts`).
- Entity/domain files: **camelCase** (`apps/blog/modules/post/domain/entities/entity.ts`,
  `apps/blog/modules/contact/domain/repositories/emailSender.ts`).
- Config files: **lowercase** (`globals.css`, `middleware.ts`).
- Component directories: **kebab-case** in apps (`apps/blog/components/article-heading/`);
  **PascalCase** in `packages/ui` (`packages/ui/src/components/Avatar/`); domain/module
  directories: **camelCase** (`useCases/`). `packages/ui` `*.module.css` keys must be
  lowerCamelCase.

### Component Patterns

- Always name the main props interface `Props`; compose with `extends` for HTML props.

```typescript
interface Props
  extends Omit<React.ComponentPropsWithRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

```
components/component-name/
├── ComponentName.tsx
├── ComponentName.stories.tsx   # if UI component
└── componentName.test.ts
```

### Import / Export Patterns

Import order (Biome enforced, newline between groups): external libraries → internal
components (relative) → domain/business logic → local same-directory.

```typescript
import Link from 'next/link';
import { Button, DropdownMenu } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';

import { Category } from '../../modules/post/domain/types';

import MotionHeader from './MotionHeader';
```

- Use `workspace:*` for internal packages; import UI components via `import { Button } from 'ui'`.
- Default exports for main components; named exports for utilities/types; barrel re-exports
  (`export * from './entity'`).

### TypeScript Patterns

```typescript
// Const-assertion enums
export const Category = { ENGINEERING: 'ENGINEERING', DESIGN: 'DESIGN' } as const;
export type Category = (typeof Category)[keyof typeof Category];
```

Strict mode, composite projects, path mapping via workspace resolution.

### Design System (UI Package)

- Use Class Variance Authority (CVA) for component variants.
- Use dot notation for compound components; set `displayName`.
- Component slot props: keep a permissive `ReactNode` type and render nothing for invalid
  (non-element) values — do not narrow the type or add a default fallback.

## State Management

- **React Query** for server state; wrap the app with `ReactQueryClientProvider`.
- **Custom hooks** prefixed with `use` (`useSnsShareInfo`), co-located when component-specific.
- **Zustand** (if used) for client-side global state; keep stores focused and minimal.

## Validation & Error Handling

- Use **Zod** for schema validation (request/response, domain input).

```typescript
export const postSchema = z.object({ id: z.string(), title: z.string() })
  .extend({ author: authorSchema });
```

- Wrap data-fetching in try/catch; use React error boundaries for components.
- Domain errors live per module in `modules/<module>/domain/errors/errors.ts` (base class
  `DomainError`; e.g. `PostAlreadyPublishedError` in the post module).
- Adapters wrap infrastructure failures in `RepositoryError`
  (`modules/<module>/adapters/shared/errors.ts`) instead of leaking raw driver errors.
- In the Hono API, `errorHandler` maps `HTTPException` to its status; any other error
  becomes 500 — throw `HTTPException` from handlers for intentional statuses.
- Detailed error taxonomy (domain → adapter → use-case → API/page boundaries):
  `.claude/rules/error-handling-guidelines.md`.

## Testing Guidelines

- Framework: Vitest with jsdom. Co-locate tests as `*.test.ts(x)` / `*.spec.ts(x)` near source.
- Libraries: React Testing Library (`@testing-library/react`, `user-event`), `vi` mocks.
- App Vitest configs define projects inline and resolve the shared setup file directly
  (see `apps/blog/vitest.config.mts`); `packages/test-utils/setupTests.ts` loads
  `@testing-library/jest-dom/vitest`.
- Coverage reporters: `text,json,html` (see `apps/blog/vitest.config.mts`).
- Test behavior over implementation; AAA structure; name the subject `sut`; prefer `it.each`
  over loops. Full standards: `.claude/rules/unit-test-guidelines.md`.
- Run before pushing: `pnpm typecheck && pnpm lint && pnpm test` (or scope via `pnpm -F blog test`).

## Internationalization (Portfolio App)

```typescript
const { lang } = await params;
const language = resolveLanguage(lang);
const dictionary = await getDictionary(language); // server-only loader (i18n/dictionaries.ts)
```

Locale detection lives in `apps/portfolio/middleware.ts` (cookie → Accept-Language →
fallback `ja`); routes are nested under `app/[lang]/`. Add new translation keys to BOTH
locale files (`apps/portfolio/i18n/locales/{ja,en}/translation.json`). Detailed
conventions: `.claude/rules/portfolio-i18n-guidelines.md`. (react-i18next is used only by
the Storybook docs in `packages/ui`.)

## Environment Variables

See `turbo.json` for the complete env list. Critical variables:

- `NOTION_TOKEN`, `NOTION_*_DATABASE_ID` — Notion API access and content database IDs.
- `CLOUDINARY_*` — image management (cloud name, API key/secret).
- `AMAZON_ACCESS_KEY_ID` / `AMAZON_SECRET_ACCESS_KEY` / `AMAZON_REGION` /
  `AMAZON_SES_SENDER_EMAIL` — AWS SES email service.
- `NEXT_PUBLIC_H_CAPTCHA_SITE_KEY` / `H_CAPTCHA_SECRET` — CAPTCHA verification.
- `INSTAGRAM_LONG_ACCESS_TOKEN` — Instagram integration.
- `API_KEY` — Hono server authentication (`x-api-key` header).
- Database connection strings for Drizzle/PostgreSQL.

## Security & Configuration

- Environment variables are required for builds (see `turbo.json` env list). Place
  app-specific secrets in `apps/*/.env.local` and never commit them.
- Avoid storing tokens in code or stories; prefer `.env` and runtime config.
- Never log PII; ensure authentication wraps protected Hono routes (`x-api-key`).

## Documentation Rules (Agent Docs)

Rules for editing `AGENTS.md`, `CLAUDE.md`, and `.claude/**` documentation:

- Never pin exact dependency versions in docs (write "Storybook 10.x" or nothing) —
  `package.json` is the source of truth.
- Code examples must reference real repository files by path, not invented ones.
- Shared cross-agent rules live only in `AGENTS.md`; deep dives go to `.claude/rules/`
  (path-scoped) or `.claude/skills/` (on-demand), with a one-line pointer from `AGENTS.md`.
- Run `pnpm docs:check` after editing agent docs — it verifies referenced paths exist and
  guards against re-introducing removed tech (`scripts/check-docs.mjs`); CI runs it too.

## Commit & Pull Request Guidelines

- Commits: gitmoji + Type format with issue reference — `<gitmoji> <Type>: #<issue> <Subject>`
  (imperative, capitalized, no trailing period). See the `commit-guidelines` skill.
- Branches: `<prefix>/<issue-number>-<summary>` derived from `main`. See the
  `branch-guidelines` skill.
- PRs: use `.github/PULL_REQUEST_TEMPLATE.md`. Include description, linked issues,
  screenshots for UI, and notes on env/config changes.
- CI: PRs run Biome checks, typecheck, tests, and Storybook/Chromatic. Ensure local checks
  pass first.

## Storybook & Chromatic

- Location: UI Storybook in `packages/ui/.storybook` with the Vite builder (`@storybook/react-vite`).
- Stories: `src/**/*.stories.@(js|jsx|ts|tsx)` and MDX docs; static assets under `packages/ui/public`.
- Local: `pnpm -F ui storybook` (port 6006). Build: `pnpm -F ui build-storybook` →
  `packages/ui/storybook-static` (build output). <!-- docs-check-ignore -->
- Visual tests: `pnpm -F ui chromatic` (requires `CHROMATIC_PROJECT_TOKEN`).
- CI: `.github/workflows/chromatic.yml` uploads on push with `onlyChanged: true`;
  review/approve diffs in Chromatic.

**Verify component properties before using them.** Before applying ANY prop on a design
system component (even common-sounding ones like `shadow`), confirm it is actually
documented for that component via its Storybook documentation or example stories. Do not
assume props from naming conventions or other libraries; if a prop is not documented, ask
rather than guess. (Claude Code: use the `k2bg-design-system` MCP tools — see `CLAUDE.md`.)

## Codex Review Guidelines

Codex posts only P0/P1 issues. Apply these rules when reviewing a pull request:

- **Missing tests (P1):** New or changed logic without co-located `*.test.ts(x)`
  coverage. Follow `.claude/rules/unit-test-guidelines.md` (behavior-focused tests,
  AAA structure, `sut` naming, no custom loops — use `it.each`).
- **Clean Architecture violations (P1):** Wrong dependency direction or layer-boundary
  crossings in the blog app's `domain` / `use-cases` / `adapters` slices.
  See the `clean-architecture-guidelines` skill.
- **Security / secrets (P0):** PII in logs, API keys or secrets leaked into code or
  stories, missing authentication on Hono routes/`x-api-key` checks.
- **Type safety (P1):** `any` overuse and unjustified type casts. Flag abbreviated
  identifiers (use full names — `dictionary` not `dict`, `language` not `lang`)
  where Biome does not already catch them.

Defer formatting/style nits already enforced by Biome; do not duplicate lint output.

## Codex Usage & Roles

- **Codex = primary reviewer.** Automatic review runs on every PR. Use
  `@codex review` to re-review after pushing changes (Codex does not re-review
  unless asked), and `@codex fix the P1 issue` for small, scoped corrections.
- **Claude (`@claude` / local Claude Code) = primary implementer** for feature work.
- Keep the two agents from overlapping: do not ask both to implement the same PR.

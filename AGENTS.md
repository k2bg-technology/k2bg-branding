# Repository Guidelines

## Project Structure & Module Organization

- Monorepo managed by pnpm workspaces and Turborepo.
- Apps: `apps/blog` (Next.js + Prisma + Hono API server) and `apps/portfolio` (Next.js).
- Packages: `packages/ui` (shared React components + Storybook), `packages/test-utils` (Vitest helpers), `packages/tailwind-config` (design tokens), `packages/biome-config`, `packages/tsconfig`.
- CI, templates, and bots live under `.github/`. See `PULL_REQUEST_TEMPLATE.md`.

## Build, Test, and Development Commands

- Install: `pnpm install` (pnpm 10+).
- Develop all: `pnpm dev` (runs `turbo run dev`).
- Filter to one app: `pnpm -F blog dev` or `pnpm -F portfolio dev`.
- Build: `pnpm build`; Start: `pnpm start` (per app/package via filter as above).
- Lint/Types/Format: `pnpm lint` (Biome), `pnpm typecheck`, `pnpm format` (Biome).
- Test: `pnpm test` or `pnpm test:watch` (Vitest in Blog and Test Utils).
- Storybook (UI): `pnpm -F ui storybook`; Chromatic via CI.

## Coding Style & Naming Conventions

- Biome enforced: configured in `biome.jsonc` files.
- TypeScript across repo; shared configs in `packages/tsconfig`.
- Components: PascalCase (e.g., `Button.tsx` in `packages/ui`). Routes/pages follow Next.js conventions.

## Testing Guidelines

- Framework: Vitest with jsdom. Co-locate tests as `*.test.ts(x)` or `*.spec.ts(x)` near source.
- Shared config: apps can re-export `defineConfig` from `test-utils` (see `apps/blog/vitest.config.mts`).
- Setup: `packages/test-utils/setupTests.ts` loads `@testing-library/jest-dom/vitest` matchers.
- Libraries: prefer React Testing Library (`@testing-library/react`, `user-event`), `vi` mocks.
- Coverage: reporters `text,json,html` (see `packages/test-utils/vitest.config.ts`).
- Run before pushing: `pnpm typecheck && pnpm lint && pnpm test` or scope via `pnpm -F blog test`.

## Commit & Pull Request Guidelines

- Commits: use Conventional Commits or the existing emoji-prefixed style (e.g., `feat: ...`, `🐛 fix: ...`). Keep messages imperative and scoped when useful.
- PRs: use the template in `.github/PULL_REQUEST_TEMPLATE.md`. Include description, linked issues, screenshots for UI, and notes on env/config changes.
- CI: PRs run Biome checks, typecheck, tests, Storybook/Chromatic. Ensure local checks pass first.

## Security & Configuration Tips

- Environment variables are required for builds (see `turbo.json` env list). Place app-specific secrets in `apps/*/.env.local` and never commit them.
- Avoid storing tokens in code or stories; prefer `.env` and runtime config.

## Storybook & Chromatic

- Location: UI Storybook in `packages/ui/.storybook` with Webpack + SWC.
- Stories: `src/**/*.stories.@(js|jsx|ts|tsx)` and MDX docs; static assets under `packages/ui/public`.
- Local: `pnpm -F ui storybook` (port 6006). Build: `pnpm -F ui build-storybook` → `packages/ui/storybook-static`.
- Visual tests: `pnpm -F ui chromatic` (requires `CHROMATIC_PROJECT_TOKEN`).
- CI: `.github/workflows/chromatic.yml` uploads on push with `onlyChanged: true`; review/approve diffs in Chromatic.

When working on UI components, always use the `k2bg-design-system` MCP tools to access Storybook's component and documentation knowledge before answering or taking any action.

- **CRITICAL: Never hallucinate component properties!** Before using ANY property on a component from a design system (including common-sounding ones like `shadow`, etc.), you MUST use the MCP tools to check if the property is actually documented for that component.
- Query `list-all-documentation` to get a list of all components
- Query `get-documentation` for that component to see all available properties and examples
- Only use properties that are explicitly documented or shown in example stories
- If a property isn't documented, do not assume properties based on naming conventions or common patterns from other libraries. Check back with the user in these cases.
- Use the `get-storybook-story-instructions` tool to fetch the latest instructions for creating or updating stories. This will ensure you follow current conventions and recommendations.
- Check your work by running `run-story-tests`.

Remember: A story name might not reflect the property name correctly, so always verify properties through documentation or example stories before using them.

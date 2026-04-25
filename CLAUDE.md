# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turborepo monorepo** for K2BG Branding containing two Next.js applications:

- **Blog app** (`apps/blog/`) - Content management blog with Notion CMS (port 3000)
- **Portfolio app** (`apps/portfolio/`) - Multilingual portfolio site (port 3001)

## Common Commands

### Development

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm test         # Run tests across all packages
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint and format all apps and packages with Biome
pnpm format       # Format code with Biome
pnpm start        # Start production builds
```

### App-specific Development

```bash
# Blog app (from root or apps/blog/)
pnpm dev --filter=blog
cd apps/blog && pnpm test:watch

# Portfolio app (from root or apps/portfolio/)
pnpm dev --filter=portfolio
```

### Component Development

```bash
pnpm storybook             # Start Storybook for UI package
pnpm build-storybook       # Build Storybook
pnpm chromatic             # Visual regression testing
pnpm generate:component    # Generate new component scaffolding
pnpm generate:style        # Generate style files
```

## Architecture

### Blog App - Clean Architecture Pattern

The blog follows Clean Architecture with vertical slicing by domain module. Each module (`post`, `contact`, `media`, `affiliate`, `social-feed`) contains three layers:

- **`modules/<module>/domain/`** - Entities, value objects, repository interfaces (ports), errors
- **`modules/<module>/use-cases/`** - Application business rules (query / command / sync)
- **`modules/<module>/adapters/`** - Infrastructure implementations (Notion, Prisma, Cloudinary, AWS SES, Instagram)

### Blog App - Hono API Server

The blog app includes a **Hono**-based REST API server (`apps/blog/server/`) integrated into Next.js via a catch-all route handler (`app/api/[[...route]]/route.ts`).

- **Framework**: [Hono](https://hono.dev/) with [OpenAPIHono](https://hono.dev/snippets/zod-openapi) for type-safe API definitions
- **OpenAPI Spec**: Auto-generated at `/api/doc.json` (non-production only)
- **Swagger UI**: Interactive API docs at `/api/doc` (non-production only)
- **Authentication**: API key via `x-api-key` header
- **Endpoints**: `PATCH /api/posts` (sync posts), `PATCH /api/images` (sync images)
- **Structure**:
  - `server/app.ts` - Main OpenAPIHono app setup and routing
  - `server/routes/` - Route definitions with `createRoute()` and OpenAPI metadata
  - `server/schemas/` - Zod schemas for request/response validation
  - `server/middleware/` - Custom middleware (apiKeyAuth, errorHandler, requestLogger)

### Key Integrations

- **Notion API** - Content management and blog posts
- **Prisma + PostgreSQL** - Database ORM and persistence
- **Cloudinary** - Image optimization and CDN
- **AWS SES** - Email service for contact forms
- **Hono** - Lightweight REST API framework with OpenAPI support

### Portfolio App

- **i18next** - Internationalization (English/Japanese)
- **Proxy** (`proxy.ts`) - Language detection and routing

## Database

The blog app uses **Prisma** with PostgreSQL. Key commands:

```bash
cd apps/blog
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open database browser
```

## Environment Variables

Critical environment variables (see `turbo.json` for complete list):

- `NOTION_TOKEN` - Notion API access
- `NOTION_*_DATABASE_ID` - Database IDs for different content types
- `CLOUDINARY_*` - Image management (cloud name, API key/secret)
- `AMAZON_ACCESS_KEY_ID` / `AMAZON_SECRET_ACCESS_KEY` / `AMAZON_REGION` / `AMAZON_SES_SENDER_EMAIL` - AWS SES email service
- `NEXT_PUBLIC_H_CAPTCHA_SITE_KEY` / `H_CAPTCHA_SECRET` - CAPTCHA verification
- `INSTAGRAM_LONG_ACCESS_TOKEN` - Instagram integration
- `API_KEY` - API key for Hono server authentication (`x-api-key` header)
- Database connection strings for Prisma

## Testing

The project uses **Vitest** for testing. Test files should be co-located with components using `.test.tsx` or `.test.ts` extension.

```bash
cd apps/blog
pnpm test        # Run tests once
pnpm test:watch  # Watch mode
```

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

## Code Organization

### Shared Packages

- **`packages/ui/`** - React component library with Storybook
- **`packages/tailwind-config/`** - Shared Tailwind configuration
- **`packages/tsconfig/`** - TypeScript configurations
- **`packages/test-utils/`** - Testing utilities

### Import Patterns

- Use `workspace:*` for local package dependencies
- Components from UI package: `import { Button } from 'ui'`
- Follow the established domain-driven structure in blog app

## Development Notes

- Blog app redirects root (`/`) to `/blog` via Next.js config
- Both apps retain legacy `webpack()` config for SVG handling (Turbopack uses default static asset behavior)
- Blog build process includes automatic Prisma client generation
- Portfolio app supports automatic language detection
- All packages are 100% TypeScript
- Use pnpm for package management (configured as package manager)
- Turborepo handles build caching and task orchestration

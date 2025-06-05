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
pnpm lint         # Lint all apps and packages
pnpm format       # Format code with Prettier
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
pnpm storybook         # Start Storybook for UI package
pnpm build-storybook   # Build Storybook
pnpm chromatic         # Visual regression testing
```

## Architecture

### Blog App - Clean Architecture Pattern

The blog follows a layered architecture with clear separation:

- **`modules/domain/`** - Business entities and core logic
- **`modules/data-access/`** - External integrations (Notion, Prisma, Cloudinary, SendGrid)
- **`modules/use-cases/`** - Application business rules
- **`modules/interfaces/`** - Input validation and adapters

### Key Integrations

- **Notion API** - Content management and blog posts
- **Prisma + PostgreSQL** - Database ORM and persistence
- **Cloudinary** - Image optimization and CDN
- **SendGrid** - Email service for contact forms

### Portfolio App

- **i18next** - Internationalization (English/Japanese)
- **Middleware** - Language detection and routing

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
- `CLOUDINARY_*` - Image management
- `SEND_GRID_API_KEY` - Email service
- Database connection strings for Prisma

## Testing

The project uses **Vitest** for testing. Test files should be co-located with components using `.test.tsx` extension.

```bash
cd apps/blog
pnpm test        # Run tests once
pnpm test:watch  # Watch mode
```

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
- Portfolio app supports automatic language detection
- All packages are 100% TypeScript
- Use pnpm for package management (configured as package manager)
- Turborepo handles build caching and task orchestration

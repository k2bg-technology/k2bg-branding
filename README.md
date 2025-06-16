# 🎨 K2BG Branding

A Turborepo monorepo for K2BG Branding containing modern web applications and shared component libraries.

## 📋 What's inside?

This Turborepo includes the following applications and packages:

### 🚀 Applications

- **`blog`**: Next.js blog application with Notion CMS integration (port 3000)
- **`portfolio`**: Multilingual portfolio site with i18next (port 3001)

### 📦 Packages

- **`ui`**: React component library with Storybook and design system
- **`tailwind-config`**: Shared Tailwind CSS configuration with design tokens
- **`tsconfig`**: TypeScript configurations used throughout the monorepo
- **`test-utils`**: Testing utilities and configurations for Vitest
- **`eslint-config-custom`**: ESLint configurations (includes `eslint-config-next` and `eslint-config-prettier`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## 🛠️ Technology Stack

### Core Technologies

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/repo)** - High-performance build system for JavaScript/TypeScript codebases

### Blog App Technologies

- **[Notion API](https://developers.notion.com/)** - Content management system
- **[Prisma](https://www.prisma.io/)** - Database ORM with PostgreSQL
- **[Cloudinary](https://cloudinary.com/)** - Image and media management
- **[SendGrid](https://sendgrid.com/)** - Email service for contact forms
- **[React Query](https://tanstack.com/query/latest)** - Data fetching and caching
- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation

### Portfolio App Technologies

- **[i18next](https://www.i18next.com/)** - Internationalization framework
- **[react-i18next](https://react.i18next.com/)** - React integration for i18n

### Development & Testing

- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Storybook](https://storybook.js.org/)** - Tool for building UI components in isolation
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io)** - Code formatting
- **[Chromatic](https://www.chromatic.com/)** - Visual regression testing

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 17 or higher)
- **pnpm** (version 8.6.10 or higher)
- **PostgreSQL** database (for blog app)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd k2bg-branding

# Install dependencies
pnpm install
```

### Development Commands

#### Start All Applications

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm start        # Start production builds
pnpm lint         # Lint all apps and packages
pnpm format       # Format code with Prettier
pnpm test         # Run tests across all packages
pnpm test:watch   # Run tests in watch mode
```

#### App-specific Development

```bash
# Blog app only (runs on port 3000)
pnpm dev --filter=blog

# Portfolio app only (runs on port 3001)
pnpm dev --filter=portfolio
```

#### Component Development

```bash
pnpm storybook             # Start Storybook for UI package
pnpm build-storybook       # Build Storybook static files
pnpm chromatic             # Run visual regression testing
pnpm generate:component    # Generate new component scaffolding
pnpm generate:style        # Generate style files
```

## 🏗️ Architecture

### Blog App - Clean Architecture Pattern

The blog application follows clean architecture principles:

- **`modules/domain/`** - Business entities and core logic
- **`modules/data-access/`** - External integrations (Notion, Prisma, etc.)
- **`modules/use-cases/`** - Application business rules
- **`modules/interfaces/`** - Input validation and adapters

This structure ensures separation of concerns and maintainable code.

### Shared Packages Structure

- **UI Package**: Component library with Storybook documentation
- **Tailwind Config**: Design tokens and shared styling configuration
- **TypeScript Config**: Shared TypeScript configurations across the monorepo
- **Test Utils**: Common testing utilities and Vitest configuration

## 🗄️ Database Setup

The blog app uses **Prisma** with PostgreSQL. Here are the key commands:

```bash
# Navigate to blog app
cd apps/blog

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database browser)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## 🔧 Environment Setup

Create environment files with the required variables:

### Blog App (`.env.local` in `apps/blog/`)

```bash
# Notion API
NOTION_TOKEN=your_notion_token
NOTION_POST_DATABASE_ID=your_post_database_id
NOTION_MEDIA_DATABASE_ID=your_media_database_id
NOTION_AFFILIATE_DATABASE_ID=your_affiliate_database_id
NOTION_CONCEPT_PAGE_ID=your_concept_page_id

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# Media & Email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SEND_GRID_API_KEY=your_sendgrid_key
SEND_GRID_SINGLE_SENDER_DOMAIN=your_domain

# Security
NEXT_PUBLIC_H_CAPTCHA_SITE_KEY=your_hcaptcha_site_key
H_CAPTCHA_SECRET=your_hcaptcha_secret

# Social
INSTAGRAM_LONG_ACCESS_TOKEN=your_instagram_token
NEXT_PUBLIC_X_TIMELINE_URL=your_x_timeline_url

# Analytics
GOOGLE_TAG_MANAGER_ID=your_gtm_id
```

### Portfolio App (`.env.local` in `apps/portfolio/`)

```bash
# Add portfolio-specific environment variables here
```

## 📝 Additional Notes

### Development Tips

- Blog app redirects root (`/`) to `/blog` via Next.js configuration
- Blog app uses `--turbo` flag for faster development builds
- Portfolio app supports automatic language detection
- All packages use pnpm for package management
- Turborepo handles build caching and task orchestration

### Internationalization (Portfolio App)

The portfolio app supports multiple languages using i18next:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('common');
```

### Testing

Tests should be co-located with components using `.test.tsx` or `.test.ts` extension:

```bash
cd apps/blog
pnpm test        # Run tests once
pnpm test:watch  # Watch mode
```

## 📚 Useful Links

Learn more about the technologies used in this project:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [i18next Documentation](https://www.i18next.com/)
- [Vitest Documentation](https://vitest.dev/)

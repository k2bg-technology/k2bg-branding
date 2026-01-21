# K2BG Branding

A modern **Turborepo monorepo** for K2BG Branding containing a technology blog and multilingual portfolio website built with Next.js and TypeScript.

## 🚀 What's inside?

This monorepo includes the following applications and packages:

### 📱 Applications

- **`blog`** - Next.js blog application with Notion CMS integration (port 3000)
- **`portfolio`** - Multilingual portfolio website with i18next (port 3001)

### 📦 Packages

- **`ui`** - React component library with Storybook documentation
- **`tailwind-config`** - Shared Tailwind CSS configuration and design tokens
- **`biome-config`** - Shared Biome configurations
- **`tsconfig`** - TypeScript configurations used throughout the monorepo
- **`test-utils`** - Shared testing utilities with Vitest

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## 🛠️ Technology Stack

### Core Technologies

- **[Next.js](https://nextjs.org/)** - React framework for both applications
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/repo)** - Monorepo build system

### Blog App Integrations

- **[Notion API](https://developers.notion.com/)** - Content management system
- **[Prisma](https://www.prisma.io/)** + **PostgreSQL** - Database ORM and persistence
- **[Cloudinary](https://cloudinary.com/)** - Image optimization and CDN
- **[SendGrid](https://sendgrid.com/)** - Email service for contact forms
- **[Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)** - Social media integration

### Portfolio App Features

- **[react-i18next](https://react.i18next.com/)** - Internationalization (English/Japanese)
- **[Formspree](https://formspree.io/)** - Contact form handling

### Development Tools

- **[Biome](https://biomejs.dev/)** - Code linting and formatting
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Storybook](https://storybook.js.org/)** - Component development and documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8.6.10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd k2bg-branding

# Install dependencies
pnpm install
```

## 🏃‍♂️ Development

### Start All Applications

```bash
pnpm dev          # Start both blog (3000) and portfolio (3001) apps
```

### Start Individual Applications

```bash
# Blog app only
pnpm dev --filter=blog

# Portfolio app only
pnpm dev --filter=portfolio
```

### Component Development

```bash
pnpm storybook             # Start Storybook for UI package
pnpm build-storybook       # Build Storybook
pnpm chromatic             # Visual regression testing
```

## 🏗️ Build & Production

```bash
pnpm build        # Build all apps and packages
pnpm start         # Start production builds
```

## 🧪 Testing & Quality

```bash
pnpm test         # Run tests across all packages
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint and format all apps and packages with Biome
pnpm typecheck    # TypeScript type checking
pnpm format       # Format code with Biome
```

## 🏛️ Architecture

### Monorepo Overview

```mermaid
flowchart TB
    subgraph "K2BG Branding Monorepo"
        subgraph "Apps"
            Blog["🌐 Blog App<br/>(port 3000)"]
            Portfolio["🌐 Portfolio App<br/>(port 3001)"]
        end

        subgraph "Shared Packages"
            UI["📦 ui<br/>Component Library"]
            TailwindConfig["📦 tailwind-config<br/>Design System"]
            BiomeConfig["📦 biome-config<br/>Code Quality"]
            TSConfig["📦 tsconfig<br/>TypeScript Config"]
            TestUtils["📦 test-utils<br/>Testing Utilities"]
        end
    end

    Blog -.-> UI
    Blog -.-> TailwindConfig
    Blog -.-> BiomeConfig
    Blog -.-> TSConfig
    Blog -.-> TestUtils

    Portfolio -.-> UI
    Portfolio -.-> TailwindConfig
    Portfolio -.-> BiomeConfig
    Portfolio -.-> TSConfig

    classDef appStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef packageStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff

    class Blog,Portfolio appStyle
    class UI,TailwindConfig,BiomeConfig,TSConfig,TestUtils packageStyle
```

### Blog App Clean Architecture

```mermaid
flowchart TB
    subgraph "External Services"
        Notion["📄 Notion API<br/>CMS Content"]
        PostgreSQL["🗄️ PostgreSQL<br/>Database"]
        Cloudinary["☁️ Cloudinary<br/>Image CDN"]
        SendGrid["📧 SendGrid<br/>Email Service"]
        Instagram["📷 Instagram API<br/>Social Media"]
    end

    subgraph "Blog App Architecture"
        subgraph "Interfaces Layer"
            AuthorInterface["👤 Author Interface"]
            ContactInterface["📬 Contact Interface"]
            PostInterface["📝 Post Interface"]
            AffiliateInterface["🛒 Affiliate Interface"]
            MediaInterface["🖼️ Media Interface"]
        end

        subgraph "Use Cases Layer"
            ContactUseCase["📬 Contact Use Case"]
            PostUseCases["📝 Post Use Cases"]
            MediaUseCases["🖼️ Media Use Cases"]
        end

        subgraph "Domain Layer"
            AuthorDomain["👤 Author Domain"]
            ContactDomain["📬 Contact Domain"]
            PostDomain["📝 Post Domain"]
            AffiliateDomain["🛒 Affiliate Domain"]
            ImageDomain["🖼️ Image Domain"]
            MediaDomain["🖼️ Media Domain"]
        end

        subgraph "Data Access Layer"
            NotionDA["📄 Notion Data Access"]
            PrismaDA["🗄️ Prisma Data Access"]
            CloudinaryDA["☁️ Cloudinary Data Access"]
            SendGridDA["📧 SendGrid Data Access"]
            InstagramDA["📷 Instagram Data Access"]
        end
    end

    AuthorInterface --> ContactUseCase
    ContactInterface --> ContactUseCase
    PostInterface --> PostUseCases
    AffiliateInterface --> PostUseCases
    MediaInterface --> MediaUseCases

    ContactUseCase --> ContactDomain
    PostUseCases --> PostDomain
    PostUseCases --> AffiliateDomain
    MediaUseCases --> MediaDomain
    MediaUseCases --> ImageDomain

    ContactDomain --> SendGridDA
    PostDomain --> NotionDA
    PostDomain --> PrismaDA
    AffiliateDomain --> NotionDA
    MediaDomain --> NotionDA
    MediaDomain --> CloudinaryDA
    ImageDomain --> CloudinaryDA
    MediaDomain --> InstagramDA

    SendGridDA --> SendGrid
    NotionDA --> Notion
    PrismaDA --> PostgreSQL
    CloudinaryDA --> Cloudinary
    InstagramDA --> Instagram

    classDef interfaceStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef useCaseStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef domainStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef dataStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef externalStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class AuthorInterface,ContactInterface,PostInterface,AffiliateInterface,MediaInterface interfaceStyle
    class ContactUseCase,PostUseCases,MediaUseCases useCaseStyle
    class AuthorDomain,ContactDomain,PostDomain,AffiliateDomain,ImageDomain,MediaDomain domainStyle
    class NotionDA,PrismaDA,CloudinaryDA,SendGridDA,InstagramDA dataStyle
    class Notion,PostgreSQL,Cloudinary,SendGrid,Instagram externalStyle
```

### Portfolio App Architecture

```mermaid
flowchart TB
    subgraph "External Services"
        Formspree["📝 Formspree<br/>Contact Forms"]
    end

    subgraph "Portfolio App Architecture"
        subgraph "Frontend Layer"
            Pages["📄 Pages<br/>Next.js Routes"]
            Components["🧩 Components<br/>UI Elements"]
            Layouts["🎨 Layouts<br/>Page Structure"]
        end

        subgraph "Internationalization"
            Middleware["⚙️ i18n Middleware<br/>Language Detection"]
            Translations["🌐 Translation Files<br/>en/ja Resources"]
            I18NextConfig["⚙️ i18next Config<br/>Language Setup"]
        end

        subgraph "Generation & Optimization"
            SSG["⚡ Static Site Generation<br/>Build Time Rendering"]
            ResponsiveDesign["📱 Responsive Design<br/>Mobile/Desktop"]
            ImageOptimization["🖼️ Image Optimization<br/>Next.js Image"]
        end

        subgraph "Shared Resources"
            UIPackage["📦 UI Package<br/>Component Library"]
            TailwindTheme["🎨 Tailwind Config<br/>Design System"]
        end
    end

    Pages --> Middleware
    Middleware --> Translations
    Middleware --> I18NextConfig

    Pages --> Components
    Components --> Layouts
    Components --> UIPackage
    Layouts --> TailwindTheme

    Pages --> SSG
    SSG --> ResponsiveDesign
    ResponsiveDesign --> ImageOptimization

    Components -.->|Contact Form| Formspree

    classDef frontendStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef i18nStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef optimizationStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef sharedStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef externalStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class Pages,Components,Layouts frontendStyle
    class Middleware,Translations,I18NextConfig i18nStyle
    class SSG,ResponsiveDesign,ImageOptimization optimizationStyle
    class UIPackage,TailwindTheme sharedStyle
    class Formspree externalStyle
```

### External Services Integration

```mermaid
flowchart TB
    subgraph "K2BG Branding Ecosystem"
        subgraph "Blog App Services"
            BlogApp["🌐 Blog App"]
        end

        subgraph "Portfolio App Services"
            PortfolioApp["🌐 Portfolio App"]
        end

        subgraph "Content Management"
            NotionCMS["📄 Notion API<br/>- Post Database<br/>- Media Database<br/>- Affiliate Database<br/>- Concept Pages"]
        end

        subgraph "Data Persistence"
            PostgreSQLDB["🗄️ PostgreSQL<br/>with Prisma ORM<br/>- Schema Management<br/>- Query Builder"]
        end

        subgraph "Media & CDN"
            CloudinaryService["☁️ Cloudinary<br/>- Image Optimization<br/>- CDN Delivery<br/>- Asset Management"]
        end

        subgraph "Communication Services"
            EmailService["📧 SendGrid<br/>- Contact Forms<br/>- Email Templates<br/>- Delivery Analytics"]
            ContactForms["📝 Formspree<br/>- Portfolio Contact<br/>- Form Handling"]
        end

        subgraph "Social Integration"
            SocialMedia["📷 Instagram API<br/>- Content Sync<br/>- Media Display"]
            TwitterTimeline["🐦 X Timeline<br/>- Social Feed<br/>- Tweet Embedding"]
        end

        subgraph "Security & Analytics"
            CaptchaService["🛡️ hCaptcha<br/>- Bot Protection<br/>- Form Security"]
            Analytics["📊 Google Tag Manager<br/>- User Analytics<br/>- Performance Tracking"]
        end
    end

    BlogApp --> NotionCMS
    BlogApp --> PostgreSQLDB
    BlogApp --> CloudinaryService
    BlogApp --> EmailService
    BlogApp --> SocialMedia
    BlogApp --> TwitterTimeline
    BlogApp --> CaptchaService
    BlogApp --> Analytics

    PortfolioApp --> ContactForms
    PortfolioApp --> CloudinaryService
    PortfolioApp --> Analytics

    classDef appStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef cmsStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef dataStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef mediaStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef commStyle fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    classDef socialStyle fill:#06B6D4,stroke:#0891B2,stroke-width:2px,color:#fff
    classDef securityStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class BlogApp,PortfolioApp appStyle
    class NotionCMS cmsStyle
    class PostgreSQLDB dataStyle
    class CloudinaryService mediaStyle
    class EmailService,ContactForms commStyle
    class SocialMedia,TwitterTimeline socialStyle
    class CaptchaService,Analytics securityStyle
```

### Development & Build Pipeline

```mermaid
flowchart TB
    subgraph "Development Environment"
        subgraph "Monorepo Management"
            Turborepo["⚡ Turborepo<br/>- Task Orchestration<br/>- Dependency Caching<br/>- Parallel Execution"]
            PNPMWorkspaces["📦 PNPM Workspaces<br/>- Package Management<br/>- Dependency Resolution"]
        end

        subgraph "Development Tools"
            BiomeTool["🔍 Biome<br/>- Code Linting<br/>- Code Formatting<br/>- Auto-fix"]
            TypeScriptTool["🔷 TypeScript<br/>- Type Checking<br/>- Compile-time Safety"]
        end

        subgraph "Testing Framework"
            VitestTool["🧪 Vitest<br/>- Unit Testing<br/>- Test Runner"]
            StorybookTool["📚 Storybook<br/>- Component Development<br/>- Visual Testing"]
            ChromaticTool["👁️ Chromatic<br/>- Visual Regression<br/>- UI Review"]
        end

        subgraph "Build Process"
            NextJSBuild["⚡ Next.js Build<br/>- App Compilation<br/>- Bundle Optimization"]
            TailwindBuild["🎨 Tailwind CSS<br/>- Style Processing<br/>- Purge Unused"]
            TypeGeneration["🔧 Type Generation<br/>- Prisma Client<br/>- API Types"]
        end
    end

    subgraph "Development Workflow"
        DevStart["🚀 pnpm dev"]
        BuildProcess["🏗️ pnpm build"]
        TestSuite["🧪 pnpm test"]
        LintCheck["🔍 pnpm lint"]
        TypeCheck["🔷 pnpm typecheck"]
    end

    DevStart --> Turborepo
    BuildProcess --> Turborepo
    TestSuite --> Turborepo
    LintCheck --> Turborepo
    TypeCheck --> Turborepo

    Turborepo --> PNPMWorkspaces
    Turborepo --> NextJSBuild
    Turborepo --> TailwindBuild
    Turborepo --> TypeGeneration

    PNPMWorkspaces --> BiomeTool
    PNPMWorkspaces --> TypeScriptTool
    PNPMWorkspaces --> VitestTool
    PNPMWorkspaces --> StorybookTool

    StorybookTool --> ChromaticTool

    classDef monorepoStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef devToolStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef testStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef buildStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef workflowStyle fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff

    class Turborepo,PNPMWorkspaces monorepoStyle
    class BiomeTool,TypeScriptTool devToolStyle
    class VitestTool,StorybookTool,ChromaticTool testStyle
    class NextJSBuild,TailwindBuild,TypeGeneration buildStyle
    class DevStart,BuildProcess,TestSuite,LintCheck,TypeCheck workflowStyle
```

### Blog App - Clean Architecture Pattern

The blog application follows a layered architecture with clear separation of concerns:

- **`modules/domain/`** - Business entities and core logic
- **`modules/data-access/`** - External integrations (Notion, Prisma, Cloudinary, SendGrid)
- **`modules/use-cases/`** - Application business rules
- **`modules/interfaces/`** - Input validation and adapters

### Portfolio App

- Internationalized routing with middleware for language detection
- Static site generation for optimal performance
- Responsive design optimized for mobile and desktop

## 🗄️ Database

The blog app uses **Prisma** with PostgreSQL. Key commands:

```bash
cd apps/blog
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open database browser
```

### Local Database (Docker)

You can run PostgreSQL locally using Docker for development.

#### Start

```bash
docker compose up -d
```

#### Stop

```bash
docker compose down
```

#### Initial Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Set up environment variables
cp apps/blog/.env.local.example apps/blog/.env.local
# Or add DATABASE_URL to your existing .env file

# 3. Run migrations
cd apps/blog && npx prisma migrate dev
```

#### Reset Database

```bash
docker compose down
rm -rf .docker/postgres/data
docker compose up -d
cd apps/blog && npx prisma migrate dev
```

## ⚙️ Environment Setup

### Required Environment Variables

Create `.env.local` files in the respective app directories with the following variables:

#### Blog App (`apps/blog/.env.local`)

```bash
# Notion CMS
NOTION_TOKEN=your_notion_token
NOTION_POST_DATABASE_ID=your_post_database_id
NOTION_MEDIA_DATABASE_ID=your_media_database_id
NOTION_AFFILIATE_DATABASE_ID=your_affiliate_database_id
NOTION_CONCEPT_PAGE_ID=your_concept_page_id

# Database
DATABASE_URL=your_postgresql_connection_string

# Image Management
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
SEND_GRID_API_KEY=your_sendgrid_api_key
SEND_GRID_SINGLE_SENDER_DOMAIN=your_domain

# Social Media
INSTAGRAM_LONG_ACCESS_TOKEN=your_instagram_token
NEXT_PUBLIC_X_TIMELINE_URL=your_x_timeline_url

# Security
NEXT_PUBLIC_H_CAPTCHA_SITE_KEY=your_hcaptcha_site_key
H_CAPTCHA_SECRET=your_hcaptcha_secret

# Analytics
GOOGLE_TAG_MANAGER_ID=your_gtm_id
```

#### Portfolio App (`apps/portfolio/.env.local`)

```bash
# Contact Form
FORMSPREE_FORM_ACTION_URL=your_formspree_url
```

## 📚 Useful Links

Learn more about the technologies used:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)

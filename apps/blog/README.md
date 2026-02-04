# K2BG Blog

A **Next.js 15** blog application with **Notion CMS** integration, built following **Clean Architecture** and **Domain-Driven Design** principles. Part of the [K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL, Prisma ORM |
| **CMS** | Notion API |
| **Email** | AWS SES |
| **Image CDN** | Cloudinary |
| **State** | Zustand, TanStack React Query |
| **Forms** | React Hook Form, Zod, hCaptcha |
| **Templating** | Handlebars (email templates) |
| **Testing** | Vitest, Testing Library, MSW |
| **Linting** | Biome |
| **Docs** | Storybook 10 |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.15.9+
- PostgreSQL (or Docker)

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# From monorepo root
pnpm dev --filter=blog

# Or from this directory
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

The build runs `prisma generate && next build` to ensure the Prisma client is up to date.

### Storybook

```bash
pnpm storybook
```

Opens on [http://localhost:6007](http://localhost:6007).

### Testing

```bash
pnpm test          # Run once
pnpm test:watch    # Watch mode
```

## Architecture

The blog follows a **Clean Architecture** pattern with vertical slicing by domain module. Each module encapsulates its own domain logic, use cases, and adapters.

### Domain Modules

| Module | Description |
|---|---|
| `post` | Blog post management, categories, search |
| `contact` | Contact form handling and email delivery |
| `media` | Media asset management |
| `affiliate` | Affiliate link and banner management |
| `social-feed` | Social media feed integration (Instagram) |

### Layer Structure

Each module follows the same layered structure:

```
modules/<module>/
  domain/
    entities/          # Domain entities
    value-objects/     # Value objects with validation
    repositories/      # Repository interfaces (ports)
    types/             # Domain types
    errors/            # Domain-specific errors
  use-cases/
    query/             # Read operations (CQRS)
    command/           # Write operations (CQRS)
    sync/              # External data synchronization
  adapters/
    output/            # Infrastructure adapters (implementations)
```

### Use Cases

**Post**
- `fetch-posts` / `fetch-post` / `fetch-posts-by-category` / `fetch-all-slugs` / `search-posts`
- `sync-posts-from-external` / `sync-hero-images`

**Contact**
- `send-email`

**Affiliate**
- `fetch-affiliate` / `fetch-affiliates-by-ids` / `fetch-all-image-sources`

**Media**
- `fetch-media` / `fetch-all-image-sources`

**Social Feed**
- `fetch-feed`

### Adapters

| Adapter | Service | Used By |
|---|---|---|
| Notion | Notion API | post, affiliate, media |
| Prisma | PostgreSQL | post |
| Cloudinary | Cloudinary CDN | post, media |
| AWS SES | Amazon SES | contact |
| Instagram | Instagram API | social-feed |

### Clean Architecture Diagram

```mermaid
flowchart TB
    subgraph "External Services"
        Notion["Notion API<br/>CMS Content"]
        PostgreSQL["PostgreSQL<br/>Database"]
        Cloudinary["Cloudinary<br/>Image CDN"]
        AWSSES["AWS SES<br/>Email Service"]
        Instagram["Instagram API<br/>Social Media"]
    end

    subgraph "App Layer (Next.js Routes)"
        PostRoutes["Post Routes<br/>/blog, /category, /search"]
        ContactRoutes["Contact Routes<br/>/contact"]
        APIRoutes["API Routes<br/>/api/posts, /api/images"]
    end

    subgraph "Modules"
        subgraph "post"
            PostUseCases["Use Cases<br/>fetch / sync"]
            PostDomain["Domain<br/>Post, AuthorId"]
            PostAdapters["Adapters<br/>Notion, Prisma, Cloudinary"]
        end

        subgraph "contact"
            ContactUseCases["Use Cases<br/>send-email"]
            ContactDomain["Domain<br/>Contact, Email, Name"]
            ContactAdapters["Adapters<br/>AWS SES"]
        end

        subgraph "affiliate"
            AffiliateUseCases["Use Cases<br/>fetch"]
            AffiliateDomain["Domain<br/>Affiliate, Banner, Product"]
            AffiliateAdapters["Adapters<br/>Notion"]
        end

        subgraph "media"
            MediaUseCases["Use Cases<br/>fetch"]
            MediaDomain["Domain<br/>Media, Image"]
            MediaAdapters["Adapters<br/>Notion, Cloudinary"]
        end

        subgraph "social-feed"
            SocialFeedUseCases["Use Cases<br/>fetch-feed"]
            SocialFeedDomain["Domain<br/>SocialFeed"]
            SocialFeedAdapters["Adapters<br/>Instagram"]
        end
    end

    PostRoutes --> PostUseCases
    PostRoutes --> AffiliateUseCases
    PostRoutes --> MediaUseCases
    ContactRoutes --> ContactUseCases
    APIRoutes --> PostUseCases

    PostUseCases --> PostDomain
    ContactUseCases --> ContactDomain
    AffiliateUseCases --> AffiliateDomain
    MediaUseCases --> MediaDomain
    SocialFeedUseCases --> SocialFeedDomain

    PostDomain -.->|ports| PostAdapters
    ContactDomain -.->|ports| ContactAdapters
    AffiliateDomain -.->|ports| AffiliateAdapters
    MediaDomain -.->|ports| MediaAdapters
    SocialFeedDomain -.->|ports| SocialFeedAdapters

    PostAdapters --> Notion
    PostAdapters --> PostgreSQL
    PostAdapters --> Cloudinary
    ContactAdapters --> AWSSES
    AffiliateAdapters --> Notion
    MediaAdapters --> Notion
    MediaAdapters --> Cloudinary
    SocialFeedAdapters --> Instagram

    classDef appStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef useCaseStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef domainStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef adapterStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef externalStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class PostRoutes,ContactRoutes,APIRoutes appStyle
    class PostUseCases,ContactUseCases,AffiliateUseCases,MediaUseCases,SocialFeedUseCases useCaseStyle
    class PostDomain,ContactDomain,AffiliateDomain,MediaDomain,SocialFeedDomain domainStyle
    class PostAdapters,ContactAdapters,AffiliateAdapters,MediaAdapters,SocialFeedAdapters adapterStyle
    class Notion,PostgreSQL,Cloudinary,AWSSES,Instagram externalStyle
```

### External Services Integration

```mermaid
flowchart TB
    subgraph "Blog App Ecosystem"
        BlogApp["Blog App"]

        subgraph "Content Management"
            NotionCMS["Notion API<br/>- Post Database<br/>- Media Database<br/>- Affiliate Database<br/>- Concept Pages"]
        end

        subgraph "Data Persistence"
            PostgreSQLDB["PostgreSQL<br/>with Prisma ORM<br/>- Schema Management<br/>- Query Builder"]
        end

        subgraph "Media & CDN"
            CloudinaryService["Cloudinary<br/>- Image Optimization<br/>- CDN Delivery<br/>- Asset Management"]
        end

        subgraph "Communication"
            EmailService["AWS SES<br/>- Contact Forms<br/>- Email Templates<br/>- Delivery"]
        end

        subgraph "Social Integration"
            SocialMedia["Instagram API<br/>- Content Sync<br/>- Media Display"]
            TwitterTimeline["X Timeline<br/>- Social Feed<br/>- Tweet Embedding"]
        end

        subgraph "Security & Analytics"
            CaptchaService["hCaptcha<br/>- Bot Protection<br/>- Form Security"]
            Analytics["Google Tag Manager<br/>- User Analytics<br/>- Performance Tracking"]
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

    classDef appStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef cmsStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef dataStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef mediaStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef commStyle fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    classDef socialStyle fill:#06B6D4,stroke:#0891B2,stroke-width:2px,color:#fff
    classDef securityStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class BlogApp appStyle
    class NotionCMS cmsStyle
    class PostgreSQLDB dataStyle
    class CloudinaryService mediaStyle
    class EmailService commStyle
    class SocialMedia,TwitterTimeline socialStyle
    class CaptchaService,Analytics securityStyle
```

## Database

### Prisma Commands

```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open database browser
```

### Docker Compose (Local PostgreSQL)

Start:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Initial setup:

```bash
docker compose up -d
npx prisma migrate dev
```

Reset:

```bash
docker compose down
rm -rf .docker/postgres/data
docker compose up -d
npx prisma migrate dev
```

The Docker Compose configuration runs **PostgreSQL 15 Alpine** on port `5432` with database `k2bg_blog`.

## Environment Variables

Create `apps/blog/.env.local`:

```bash
# Notion CMS
NOTION_TOKEN=
NOTION_POST_DATABASE_ID=
NOTION_MEDIA_DATABASE_ID=
NOTION_AFFILIATE_DATABASE_ID=
NOTION_CONCEPT_PAGE_ID=

# Database
DATABASE_URL=

# Image Management
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Service (AWS SES)
AMAZON_ACCESS_KEY_ID=
AMAZON_SECRET_ACCESS_KEY=
AMAZON_REGION=
AMAZON_SES_SENDER_EMAIL=

# Social Media
INSTAGRAM_LONG_ACCESS_TOKEN=
NEXT_PUBLIC_X_TIMELINE_URL=

# Security
NEXT_PUBLIC_H_CAPTCHA_SITE_KEY=
H_CAPTCHA_SECRET=

# Analytics
GOOGLE_TAG_MANAGER_ID=
```

## Project Structure

```
apps/blog/
├── app/                       # Next.js App Router
│   ├── api/                   # API routes (posts, images)
│   ├── blog/                  # Blog pages
│   ├── category/              # Category pages
│   ├── contact/               # Contact page
│   ├── search/                # Search page
│   ├── concept/               # Concept page
│   └── _mail-templates/       # Email templates (Handlebars)
├── modules/                   # Domain-driven modules
│   ├── post/                  # Post domain
│   ├── contact/               # Contact domain
│   ├── media/                 # Media domain
│   ├── affiliate/             # Affiliate domain
│   └── social-feed/           # Social feed domain
├── components/                # React components
├── infrastructure/            # External service clients
│   ├── aws-ses/               # AWS SES client
│   ├── cloudinary/            # Cloudinary client
│   ├── notion/                # Notion client
│   ├── prisma/                # Prisma client
│   ├── instagram/             # Instagram client
│   └── di/                    # Dependency injection
├── prisma/                    # Database schema & migrations
├── specs/                     # Domain specifications
├── .storybook/                # Storybook config
└── public/                    # Static assets
```

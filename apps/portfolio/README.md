# K2BG Portfolio

A **Next.js 15** multilingual portfolio website supporting **English** and **Japanese**, with automatic language detection and i18n routing. Part of the [K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **i18n** | i18next, react-i18next, i18next-browser-languagedetector |
| **Contact** | Formspree |
| **Analytics** | Google Tag Manager |
| **Linting** | Biome |
| **Docs** | Storybook 10 |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.15.9+

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# From monorepo root
pnpm dev --filter=portfolio

# Or from this directory
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

### Build

```bash
pnpm build
```

### Storybook

```bash
pnpm storybook
```

Opens on [http://localhost:6008](http://localhost:6008).

## Architecture

### i18n System

| Setting | Value |
|---|---|
| **Languages** | Japanese (`ja`), English (`en`) |
| **Default / Fallback** | `ja` |
| **Cookie name** | `i18next` |
| **Detection priority** | path > htmlTag > cookie > navigator |

**Middleware behavior:**

1. Check `i18next` cookie for saved language preference
2. Fall back to `Accept-Language` header
3. Default to `ja` if no preference is detected
4. Redirect paths without a language prefix to `/{detected-language}{pathname}`
5. Update cookie from referer URL when present

All routes are prefixed with the language code (e.g., `/ja`, `/en`).

### Sections

The portfolio is a single-page application composed of these sections:

| Section | Description |
|---|---|
| **Hero** | Company name and slogan |
| **Background** | Personal background and certifications |
| **Skill** | Technical skills organized by category |
| **Portfolio** | Project showcase with videos and images |
| **Contact** | Contact form via Formspree |

### Components

- **LanguageSelector** - Language switcher (ja/en)
- **ScrollHelper** - Scroll navigation assistance
- **Slider** - Content slider for portfolio items
- **ExternalLinkButton** - External link component
- **Footer** - Site footer with attribution

### Custom Hooks

- **useMatchMedia** - Media query matching hook using `useSyncExternalStore` for SSR-safe responsive behavior

### Portfolio App Architecture

```mermaid
flowchart TB
    subgraph "External Services"
        Formspree["Formspree<br/>Contact Forms"]
    end

    subgraph "Portfolio App Architecture"
        subgraph "Frontend Layer"
            Pages["Pages<br/>Next.js Routes"]
            Components["Components<br/>UI Elements"]
            Layouts["Layouts<br/>Page Structure"]
        end

        subgraph "Internationalization"
            Middleware["i18n Middleware<br/>Language Detection"]
            Translations["Translation Files<br/>en/ja Resources"]
            I18NextConfig["i18next Config<br/>Language Setup"]
        end

        subgraph "Generation & Optimization"
            SSG["Static Site Generation<br/>Build Time Rendering"]
            ResponsiveDesign["Responsive Design<br/>Mobile/Desktop"]
            ImageOptimization["Image Optimization<br/>Next.js Image"]
        end

        subgraph "Shared Resources"
            UIPackage["UI Package<br/>Component Library"]
            TailwindTheme["Tailwind Config<br/>Design System"]
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

## Environment Variables

Create `apps/portfolio/.env.local`:

```bash
# Contact Form
FORMSPREE_FORM_ACTION_URL=

# Analytics
GOOGLE_TAG_MANAGER_ID=
```

## Project Structure

```
apps/portfolio/
├── app/
│   └── [lng]/                 # Language-specific routes
│       ├── layout.tsx         # Root layout with GTM
│       ├── page.tsx           # Main page (all sections)
│       └── loading.tsx        # Loading fallback
├── components/
│   ├── contents/              # Page sections
│   │   ├── Hero.tsx
│   │   ├── Background.tsx
│   │   ├── Skill.tsx
│   │   ├── Portfolio.tsx
│   │   └── Contact.tsx
│   ├── footer/                # Footer component
│   ├── LanguageSelector.tsx
│   ├── ScrollHelper.tsx
│   ├── Slider.tsx
│   └── ExternalLinkButton.tsx
├── hooks/
│   └── useMatchMedia.ts       # Responsive media query hook
├── i18n/
│   ├── settings.ts            # Language configuration
│   ├── client.ts              # Client-side i18n
│   ├── index.ts               # Server-side translation helper
│   └── locales/
│       ├── en/translation.json
│       └── ja/translation.json
├── middleware.ts               # Language detection & routing
├── public/
│   ├── images/                # Background and project images
│   └── videos/                # Portfolio demo videos
└── .storybook/                # Storybook config
```

# K2BG Portfolio

A **Next.js 16** multilingual portfolio website supporting **English** and **Japanese**, with automatic language detection and i18n routing. Part of the [K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **i18n** | i18next, react-i18next, i18next-browser-languagedetector |
| **Contact** | Formspree |
| **Analytics** | Google Tag Manager |
| **Linting** | Biome |
| **Docs** | Storybook 10 |

## Getting Started

### Prerequisites

- Node.js 20.9+
- pnpm 10.33.2+

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

**Proxy behavior** (Next.js 16 `proxy.ts`)**:**

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
    Request["Client Request"] --> Middleware

    subgraph i18n["Internationalization"]
        direction TB
        Middleware["i18n Proxy<br/>Language Detection & Routing"]
        Translations["Translation Files<br/>en / ja"]
        Middleware -.-> Translations
    end

    subgraph app["Next.js Application"]
        direction TB
        Layout["Layout"] --> Page["Page /[lng]"]
        Page --> Sections["Sections<br/>Hero / Background / Skill<br/>Portfolio / Contact"]
    end

    subgraph shared["Shared Packages"]
        direction TB
        UIPackage["UI Package<br/>Component Library"]
        TailwindConfig["Tailwind Config<br/>Design System"]
    end

    Formspree["Formspree<br/>Contact Forms"]

    Middleware -->|locale| Layout
    Sections --> UIPackage
    Sections --> TailwindConfig
    Sections -.->|Contact Form| Formspree

    classDef requestStyle fill:#6B7280,stroke:#4B5563,stroke-width:2px,color:#fff
    classDef i18nStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef appStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef sharedStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef externalStyle fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    class Request requestStyle
    class Middleware,Translations i18nStyle
    class Layout,Page,Sections appStyle
    class UIPackage,TailwindConfig sharedStyle
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
├── proxy.ts                    # Language detection & routing (Next.js 16)
├── public/
│   ├── images/                # Background and project images
│   └── videos/                # Portfolio demo videos
└── .storybook/                # Storybook config
```

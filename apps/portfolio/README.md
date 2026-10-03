# K2BG Portfolio

![A white curved retro-futuristic office building in morning light, its facade dissolving into layout grids and bilingual signage panels](public/images/hero-readme.jpg)

A Next.js 16 portfolio site for K2.B.G. Technology. It supports Japanese and English with server-only dictionary-based internationalization and language-prefixed routes.

## Stack

| Category | Technologies |
| --- | --- |
| Framework | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS v4, shared `ui` package |
| i18n | Server-only JSON dictionaries |
| Contact | Formspree |
| Analytics | Google Tag Manager |
| Tooling | Biome, Storybook |

## Development

Run commands from the monorepo root:

```bash
pnpm -F portfolio dev
pnpm -F portfolio build
pnpm -F portfolio test
pnpm -F portfolio typecheck
pnpm -F portfolio lint
pnpm -F portfolio storybook
```

The development server runs on [http://localhost:3001](http://localhost:3001). Storybook runs on [http://localhost:6008](http://localhost:6008).

## Internationalization

The portfolio does not use client-side translation hooks. Server components resolve the route language, load a dictionary, and pass typed dictionary slices to leaf components.

- Routes live under `app/[lang]/`.
- Supported languages are `ja` and `en`; `ja` is the fallback.
- Dictionaries live in `i18n/locales/{ja,en}/translation.json`.
- `i18n/dictionaries.ts` is server-only; the English dictionary defines the TypeScript shape.
- `middleware.ts` performs locale detection in this order: `NEXT_LOCALE` cookie, `Accept-Language` header, then `ja`.
- The portfolio intentionally keeps `middleware.ts` because locale detection uses the edge runtime; do not rename it to `proxy.ts`.

## Structure

```text
apps/portfolio/
|-- app/
|   `-- [lang]/
|       |-- layout.tsx
|       |-- page.tsx
|       `-- loading.tsx
|-- components/
|   |-- contents/
|   |-- footer/
|   |-- ExternalLinkButton.tsx
|   |-- LanguageSelector.tsx
|   |-- ScrollHelper.tsx
|   `-- Slider.tsx
|-- hooks/
|-- i18n/
|   |-- dictionaries.ts
|   |-- settings.ts
|   `-- locales/
|-- middleware.ts
`-- public/
```

## Environment Variables

Create `apps/portfolio/.env.local` when local integrations are needed:

```bash
NEXT_PUBLIC_FORMSPREE_FORM_ACTION_URL=
GOOGLE_TAG_MANAGER_ID=
PORTFOLIO_SITE_BASE_URL=
```

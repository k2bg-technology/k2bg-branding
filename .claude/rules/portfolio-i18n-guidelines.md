---
paths: apps/portfolio/**/*.{ts,tsx}
---

# Portfolio i18n Guidelines

The portfolio app uses a **server-only dictionary loader**, NOT react-i18next. There is no
translation hook; translations flow from server components to leaf components as typed props.

## Configuration (`apps/portfolio/i18n/settings.ts`)

- Supported languages: `ja` (fallback) and `en` — `languages = [fallbackLanguage, 'en']`.
- Locale cookie: `NEXT_LOCALE` (`cookieName`).
- Always normalize a raw route param with `resolveLanguage(lang)`; it falls back to `ja`
  for unknown values.

## Locale Detection (`apps/portfolio/middleware.ts`)

- Detection priority: `NEXT_LOCALE` cookie → `Accept-Language` header → fallback `ja`.
- Paths without a locale prefix redirect to `/${locale}${pathname}`; requests that already
  carry a locale write it back to the cookie (skipping router prefetches).
- The `matcher` excludes `api`, Next.js static assets, `images`, `videos`, `assets`.
- This file stays `middleware.ts` (Next.js 16 renamed middleware to `proxy.ts`, but the
  portfolio keeps the edge-runtime default for i18n) — do not rename it. See AGENTS.md.

## Translations (`apps/portfolio/i18n/`)

- One file per locale: `apps/portfolio/i18n/locales/ja/translation.json` and
  `apps/portfolio/i18n/locales/en/translation.json`.
- `dictionaries.ts` is `server-only`: `getDictionary(language)` dynamically imports the
  locale JSON. `Dictionary` is `typeof en` — **the English file is the source of truth for
  the type**, so every new key MUST be added to BOTH files with an identical shape.
- JSON convention: top-level camelCase section objects (`hero`, `background`, `skill`,
  `portfolio`, `contact`, `footer`, `metadata`) with flat string keys; one extra nesting
  level for grouped items (e.g. `portfolio.webApp.title`).

## Consuming Translations

Canonical flow (`apps/portfolio/app/[lang]/page.tsx`):

```typescript
const { lang } = await params;                 // params is a Promise in Next.js 15+
const language = resolveLanguage(lang);
const dictionary = await getDictionary(language);

<Hero dictionary={dictionary.hero} />
```

Leaf components receive a typed slice via indexed access, never the whole dictionary:

```typescript
type HeroDictionary = Dictionary['hero'];
export function Hero({ dictionary }: { dictionary: HeroDictionary }) { /* ... */ }
```

- Do NOT add react-i18next / i18next or client-side translation hooks.
- Sections map 1:1 to components in `apps/portfolio/components/contents/`.

## Routing (`apps/portfolio/app/[lang]/`)

- The dynamic segment is `[lang]` (not `[lng]`); `layout.tsx` provides
  `generateStaticParams()` over `languages` and sets `<html lang={language}>`.
- `generateMetadata` reads `dictionary.metadata` and sets `alternates.languages`.

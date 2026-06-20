# design-sync notes — ui (K2BG Design System)

## Build setup

- `[GENERAL]` The DS package `ui` ships **TypeScript source, no `dist/`** (`main`/`types` → `index.ts`, consumed via Next `transpilePackages`). Converter bundles from source via `--entry packages/ui/index.ts`; `--node-modules` is the **repo root** `node_modules` (pnpm hoists `react`/`react-dom` there, not into `packages/ui/node_modules`).
- `[GENERAL]` `packages/ui/package.json` `main`/`types` originally pointed at a **non-existent `./index.tsx`** (real file is `index.ts`). Webpack's directory-index fallback hid it from consumers, but the converter's ts-morph export enumeration read it literally → **0 components**. Fixed to `./index.ts`. If a future run shows `exported PascalCase symbols: 0` / every component `[TITLE_UNMAPPED]`, re-check this field.
- `[GENERAL]` Tailwind v4 CSS is NOT scraped from storybook (style-loader injects at runtime, no static CSS file). Wired `cfg.cssEntry: ".ds-tailwind.css"` (relative to PKG_DIR = packages/ui) + `cfg.buildCmd` regenerates it via `@tailwindcss/cli`. The file is gitignored.

## Icon component — webpack-coupling fixes (repo source changed)

- `[GENERAL]` `Icon/index.tsx` used webpack-only `require.context` to load SVGs — esbuild (claude.ai/design's bundler) can't run it. **Refactored** to static SVG imports via a generated map (`iconUrls.generated.ts`, produced by `generateIconUrls.mjs` from `const.ts`). Static imports are bundler-agnostic (webpack asset modules + esbuild dataurl both yield a URL). Re-run `node packages/ui/src/components/Icon/generateIconUrls.mjs` after editing `const.ts`.
- `[GENERAL]` Icon mask `url()` was unquoted: `url(${src})`. esbuild's dataurl loader inlines SVGs with raw double-quotes/angle-brackets, breaking unquoted CSS `url()` → mask failed → solid square. Fixed to `url('${src}')` (single quotes; inlined data URLs never contain single quotes). Webpack file URLs are unaffected.
- `[GENERAL]` An imported SVG resolves to **different shapes per bundler**, and the Icon must handle all three: a URL **string** (webpack `asset/resource`, esbuild `dataurl`), a **`{ src }`** StaticImageData object (Next.js / **Turbopack** — `next dev` defaults to Turbopack, which IGNORES the app's `webpack(){ asset/resource }` rule), or a **`{ default: { src } }`** module namespace (the original `require.context`). `resolveIconSrc()` checks `string → .src → .default?.src`. A first cut only handled string + `.default.src` and broke icons in `next dev` (Turbopack returned `{ src }` → `url('undefined')`). Verified fixed via a real Turbopack dev render. The uploaded design-system bundle is unaffected (esbuild → string path).
- `[GENERAL]` `multi-color-icons/instagram.svg` embedded a **10 MB 2497px PNG** → bundle ballooned to 11.3 MB (>5 MB upload cap) once inlined as a data URL. Downscaled the embedded PNG to 256px (96 KB) — visually identical at the 24px render size. Bundle is now ~1 MB.

## Verification harness

- `[GENERAL]` The compare harness `http-serve.mjs` MIME map lacked `.svg` → SVGs served as `application/octet-stream`, which Chromium refuses as a CSS `mask-image` → **storybook oracle blanked all icons** (preview was fine — it uses inline data URLs). Patched the MIME map to add svg/jpg/gif/webp/woff/woff2. **This file is in `.ds-sync/` which is re-copied from the skill on every re-sync — the patch does NOT persist.** A re-sync that shows blank icons in the storybook column must re-apply this MIME fix.

## Component surface / overrides

- Barrel `index.ts` public exports: Avatar, Button, Dialog, Drawer, DropdownMenu, Form (namespace), Icon, Media (ImageViewer/MusicStreamingPlayer/VideoFilePlayer/VideoStreamingPlayer), Pagination, Popover, ScrollArea, Skelton, Toaster + utils.
- **Badge** has a story + component but is NOT exported from the barrel → deliberately excluded from the sync (`[TITLE_UNMAPPED]`). Add it to `index.ts` if it should ship.
- `cfg.overrides`: Pagination / ScrollArea / VideoStreamingPlayer → `cardMode: "column"` (stories wider than a grid cell).
- i18n decorator (`.storybook/preview.tsx`) does NOT bundle (esbuild can't load its `.mdx` import) — but NO `components/` component uses `useTranslation`, so no `cfg.provider` is needed; previews render correctly unwrapped.

## Re-sync risks

- The `.ds-sync/storybook/http-serve.mjs` `.svg` MIME patch is non-persistent (see above) — re-apply on re-sync if the storybook oracle blanks icons.
- `MusicStreamingPlayer` (Spotify) and other Media players embed remote iframes/images — capture errors / blank-on-both are expected for remote content; grade the component shell, skip unrenderable remote stories with a note.
- `Form` has 21 stories; compare caps at 6 (`[STORY_CAP]`) — tail stories verified-by-upload, not individually graded.
- Icon set is the curated `ICON_NAMES` (38) only; the full hero set (296×2) is NOT synced.

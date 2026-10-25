# Tokens and Theming

## Where Tokens Live

- **Brand tokens** — `packages/tailwind-config/design-token/`. `design-tokens.tokens.json` (kept in sync with the Figma variables) is the source; `styleDictionaryConfig.mjs` generates the CSS files beside it (`color.css` and `typography.css` as `:root` custom properties, `tailwind-theme-color.css` and `tailwind-theme-typography.css` as Tailwind `@theme` entries, all imported by `variables.css`). Generated files carry a "Do not edit directly" header: change the token JSON and run `pnpm generate:style`, never the CSS.
- **UI extension tokens** — the `@theme` block in `packages/ui/src/globals.css`: the stack gaps (`--spacing-condensed` / `normal` / `spacious`), the status colors (`--color-error`, `--color-warning`, `--color-info`, `--color-success` with `-light` / `-dark`), the chart palette (`--color-chart-*`), and the font stack (`--font-original`).
- **Video tokens** — `apps/scene-studio/src/primitives/video-theme.css`, loaded by `apps/scene-studio/src/style.css`. Scene Studio does not load the UI `@theme`, so a token Scene Studio needs is added here.
- **Names and roles** — the token families and their typical usage (page background, borders, primary action, type scale, radius) are listed in the `k2bg-figma-design` skill; this file does not repeat them.

A `@theme` entry becomes a utility only when its name is in one of Tailwind's theme namespaces: `--color-*` → `bg-*` / `text-*` (`--color-base-white` → `bg-base-white`), `--spacing-*` → `gap-*` / `p-*` (`--spacing-condensed` → `gap-condensed`), `--text-*` → `text-*`, `--radius-*` → `rounded-*`, `--z-index-*` → `z-*`. A name outside every namespace (`--z-modal`) generates nothing.

Tailwind emits a `@theme` variable into the CSS only when a utility or the processed stylesheet uses it. CSS Modules are compiled separately, so a token referenced only through `var()` in a module is dropped. The brand colors and type in `color.css` / `typography.css` are plain `:root` properties and always exist; a new token that a CSS Module reads goes into `:root` or a `@theme static` block.

## Role Tiers

The repository's tokens are named by role (`base`, `main`, `accent`, the status families, the stack gaps), and that role tier is what components reference:

- **Components use the repository's role tokens only**: `text-base-black`, `bg-main-default`, `text-error`, `var(--color-base-white)` — never a raw hex, and never Tailwind's default palette (`bg-red-500`, `var(--color-gray-500)`).
- Tailwind's default palette exists only to define role tokens, as the status colors in `packages/ui/src/globals.css` do (`--color-error: var(--color-red-500)`). A default-palette reference outside a token definition carries a comment explaining why (the `--color-gray-200` border default in the same file is the model).
- Name new tokens by role (`text-muted`, `surface-raised`, `z-modal`), not by value.

## Before Writing Any Value

The most common agent-introduced defect is a raw value duplicating an existing token — in Tailwind, an arbitrary value (`bg-[#887f7a]`, `gap-[16px]`) or a default-palette color. Before writing a color, spacing, radius, shadow, font-size, or z-index literal:

1. **Search the token layer first** — the two locations above, and the role table in `k2bg-figma-design`.
2. Use the existing token whose role matches. Role match beats value match: pick the secondary-text token because the text is secondary, not because its gray looks close.
3. Spacing uses the stack gaps (`gap-condensed` 4 / `gap-normal` 8 / `gap-spacious` 16) for related stacked elements and the numeric spacing scale (`p-3`, `gap-6`, multiples of 4px) for everything else; prefer whole steps over half-steps.
4. If no token fits, add one: a brand value goes into `design-tokens.tokens.json` and is regenerated; a UI-only value goes into the `@theme` block of `packages/ui/src/globals.css` next to its siblings. Do not inline the literal.
5. A value private to one component may stay in its file, defined as a scoped custom property once it repeats within the component.

## Theming

The repository ships a single light theme; no `dark:` variant or `data-theme` switch is configured. When a dark theme is added, it redefines the role tier only and component styles never change. A theme has three states — no explicit choice (follow the OS), explicit light, explicit dark — and every state needs both its tokens and its `color-scheme`:

```css
/* default: follow the OS */
:root { color-scheme: light dark; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-text-primary: var(--color-gray-100);
    --color-bg-surface: var(--color-gray-900);
  }
}
/* explicit choice wins in both directions */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-text-primary: var(--color-gray-100);
  --color-bg-surface: var(--color-gray-900);
}
```

- Light values live on bare `:root`; the `prefers-color-scheme` block, guarded by `:not([data-theme="light"])`, supplies dark values when the OS prefers dark and no explicit choice overrides it; `[data-theme="dark"]` repeats the dark values so the explicit choice also wins over a light OS.
- Tokens and `color-scheme` switch together. `color-scheme: light dark` on `:root` lets the browser render form controls and scrollbars by the OS preference, so the custom tokens must follow the same preference — dark controls on a light token palette is the symptom of a missing `prefers-color-scheme` block.
- Prefer switching token values over per-component `dark:` utilities. If a `dark:` variant is needed, redefine it with `@custom-variant` so it matches the same three states (OS dark without `data-theme="light"`, or `data-theme="dark"`); Tailwind's default `dark:` follows `prefers-color-scheme` alone and ignores an explicit light choice.
- Where `light-dark()` is Widely available (see `modern-css.md`), each role token can carry both values in one declaration — `--color-text-primary: light-dark(var(--color-gray-900), var(--color-gray-100));` — and the three states collapse to setting `color-scheme` alone.
- A component that uses only role tokens is dark-mode-ready by construction — this is the payoff of the role-tier rule.

## Custom Properties Beyond Tokens

- Custom properties are runtime values: use them for anything themable, user-adjustable, or set from JS via `element.style.setProperty` (or a headless library, as `--drawer-swipe-movement-x` in `packages/ui/src/components/Drawer/Drawer.module.css`).
- Give component-scoped properties a fallback: `var(--card-padding, var(--spacing-4))` documents the default and survives a missing definition.
- Static values needing build-time logic (loops, color math beyond `color-mix()`) belong in the Style Dictionary configuration; everything dynamic belongs to custom properties.

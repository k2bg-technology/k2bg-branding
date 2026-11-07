---
name: k2bg-css-guidelines
description: CSS and Tailwind styling rules for k2bg-branding — layout, spacing, units, selectors, design tokens, theming, and modern-feature adoption across Tailwind v4 utilities, CSS Modules, and global stylesheets. Use when writing, modifying, or reviewing styles in this repository (className utilities, .css, .module.css), styling components, building layouts or responsive behavior, or adding tokens or a theme. Complements base-coding-guidelines with CSS-only rules.
---

# k2bg CSS Guidelines

CSS rules and know-how for k2bg-branding, from layout mechanics to design tokens. Language-agnostic readability rules live in `base-coding-guidelines`; token names and their roles live in `k2bg-figma-design`; this skill adds only what is CSS-specific.

## Styling Layers

Styles live in three places; pick the first that can express the rule.

1. **Tailwind utilities in `className`** — the default for components in `packages/ui` and the apps. Variants are composed with CVA (see `AGENTS.md`, "Design System").
2. **CSS Modules (`*.module.css`)** — only for what utilities cannot express cleanly: `@keyframes` and multi-step animations, styling markup the component does not render (rendered Markdown, third-party widgets, via `:global`), and state selectors on data attributes set by a headless library (`packages/ui/src/components/Drawer/Drawer.module.css`).
3. **Global stylesheets** — the shared base in `packages/ui/src/globals.css`, imported by each web app's `app/globals.css`. Only resets, base typography, and app-wide rules belong here.

**Scene Studio is separate.** `apps/scene-studio` does not import `packages/ui/src/globals.css`: its entry stylesheet `apps/scene-studio/src/style.css` loads Tailwind and the brand tokens directly, and video-only tokens live in `apps/scene-studio/src/primitives/video-theme.css`. Video tokens go there, never into the UI `@theme`. Rules about preflight, the root height chain, focus, and breakpoints are web-app rules; compositions render at a fixed frame size and animate from `useCurrentFrame()` (see `AGENTS.md`, "Scene Studio").

Every rule below applies to all three layers: a Tailwind arbitrary value (`h-[200px]`, `p-[13px]`, `bg-[#887f7a]`) is a raw literal and follows the same token and magic-number rules as one written in CSS.

## Core Rules

- **Border-box and the root height chain are global** (web apps): Tailwind's preflight (loaded by `packages/ui/src/globals.css`) sets `box-sizing: border-box` and `body { margin: 0 }`, and the same file sets `html` and `body` to `h-full`. Never re-declare them per component. The page root fills with `min-h-full` (scrolling document, space distributed by flex/grid) or `h-full` (app shell, where percentage heights resolve down the chain). Viewport units (`svh`/`dvh`, never `vh` / `h-screen`) only for an element that must track the viewport independently of its ancestors. See `references/layout.md`.
- **Lay out with Flexbox and Grid only**: Flexbox for one axis, Grid for two; never `float` or `inline-block` layout. `position: absolute` only for overlay elements, never for things that belong to the flow. Flex and grid children that hold text, code, or tables get `min-w-0` so they wrap instead of widening the page. See `references/layout.md`.
- **Parents own spacing**: space between siblings comes from `gap` on the container; a component never sets its own outer margin.
- **Padding over margin**: `gap` between boxes, `padding` inside a box; `margin` only for flow prose rhythm and the `margin: auto` family. Do not mechanically swap margins for paddings — restructure to `gap`.
- **Tokens before raw values**: every color, spacing, type, and radius value comes from the design tokens in `packages/tailwind-config/design-token/` or the `@theme` block of `packages/ui/src/globals.css`, through their utilities (`bg-base-white`, `gap-condensed`, `text-body-r-md`) or custom properties (`var(--color-base-white)`). Components never use Tailwind's default palette (`bg-red-500`, `var(--color-gray-500)`) directly. See `references/tokens-and-theming.md`.
- **No magic numbers**: no fixed heights on text-bearing elements, no nudge offsets compensating for layout done wrong, no unexplained arbitrary values. See `references/units-and-sizing.md`.
- **Keep specificity low and flat**: one class level per selector (a state class or data attribute on the same element is fine); no ID selectors, no descendant chains, no `!important` (`!` utility modifier included) to win fights. See `references/selectors-and-cascade.md`.
- **Units by role**: `rem` for font sizes and media queries, `px` for borders and hairlines, `em` only for values that must track their element's font size.
- **Fluid first, breakpoints last**: make layouts stretch with `flex-wrap`, `minmax()`/`auto-fit`, and `clamp()`; add container queries (`@container`, `@md:`) for component-level shifts and mobile-first breakpoint variants (`md:`, `lg:`) only for what remains.
- **Avoid `z-index`**: solve overlap with DOM order and `isolate`; only dedicated layer components (modal, toast, dropdown) use it, via a tokenized scale. A `z-index` that does not win is trapped in an ancestor's stacking context (`transform`, `opacity`, `filter`, …) — fix the ancestor, not the number.
- **Animate `transform` and `opacity` only**, with a `prefers-reduced-motion` fallback (`motion-reduce:` / `motion-safe:` variants). See `references/performance-and-a11y.md`.
- **Theme in three states**: the repository ships one light theme. A dark theme, when added, follows three states — no explicit choice follows `prefers-color-scheme`; an explicit `data-theme` wins over it in both directions; tokens and `color-scheme` switch together. See `references/tokens-and-theming.md`.
- **Adopt modern features by Baseline status**: the supported browsers are the Baseline Widely available set, so Widely available → use freely; Newly available → gate with `@supports`. See `references/modern-css.md`.

## Reading Map

Read the reference matching the task before writing code; each file is self-contained.

| Task at hand                                                                            | Read                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------- |
| Building a layout, spacing siblings, positioning, stacking/z-index, overflow in flex/grid children, full-height layouts, responsive strategy | `references/layout.md`                |
| Choosing units, sizing boxes, fluid type, aspect ratios, arbitrary values, magic-number smells | `references/units-and-sizing.md`      |
| Naming classes, selector shape, specificity conflicts, an override that "won't apply", CSS Modules `composes`/`:global` | `references/selectors-and-cascade.md` |
| Design tokens, adding a token, custom properties, theming, dark mode                    | `references/tokens-and-theming.md`    |
| Whether a modern CSS feature is safe; replacing a legacy pattern                        | `references/modern-css.md`            |
| Animation, rendering performance, motion/focus accessibility                            | `references/performance-and-a11y.md`  |

## CSS Review Checklist

When reviewing styles, check these CSS-specific defects on top of the general review:

- Magic numbers — fixed heights on text-bearing elements, unexplained nudge values (`mt-[3px]`, `margin-top: 3px`), arbitrary values with no stated origin
- `position: absolute` where normal flow (flex/grid) would do
- A flex or grid child holding text, code, or a table without `min-w-0` — long content widens the page instead of wrapping
- `100vh` / `h-screen` anywhere, or `dvh` inside a tree the root `h-full` chain already sizes — it exceeds the chain whenever the mobile toolbar is retracted
- A percentage `height` (`h-full`) whose containing block has no definite height — an ancestor sized only by `min-height` or by its content; `min-height` alone never establishes the percentage basis, while a definite-height ancestor, a block-axis-stretched grid item, or a flex item with a definite flexed size does
- `!important` (or the `!` utility modifier) or a deepened selector used to win a specificity fight
- Raw color/size/shadow literals duplicating an existing design token, a Tailwind default-palette color in a component, or an edit to a generated token file
- Outer margins on a reusable component; sibling spacing done with margins (`mt-*`, `space-y-*`) instead of `gap`
- `z-index` introduced without need, or with an untokenized literal (`z-[999]`)
- `px` font sizes or `px` media queries — they ignore the user's font-size setting
- Animation of layout properties (`top`/`left`/`width`/`height`) instead of `transform`/`opacity`, `transition-all` / `transition: all`, or motion without a `prefers-reduced-motion` path
- Interactive elements losing their visible focus style (`outline-none` / `outline-hidden` with no `focus-visible:` replacement), or a focus ring drawn only with `box-shadow` (`ring-*`) or `background` that vanishes in forced-colors mode
- Dark-mode tokens defined only under `[data-theme="dark"]` with no `prefers-color-scheme` block — the OS-dark, no-choice state renders light tokens with dark form controls
- Legacy pattern used where a Widely-available modern feature exists (padding-top ratio hack vs `aspect-ratio`, margin chains vs `gap`)

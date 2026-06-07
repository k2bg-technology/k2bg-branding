---
name: k2bg-figma-design
description: |
  Design reference rules for the k2bg-branding design system — the color, spacing, typography,
  radius and border tokens, the layout grid, and the component library to reuse.

  Use this whenever you design, build, or review a screen, component, mockup, or visual for
  k2bg-branding (apps/blog, apps/portfolio) so the work follows the established design tokens and
  layout instead of inventing ad-hoc colors, spacing, or type. Consult it before placing any color,
  gap, padding, radius, or text size, and before building a UI element that the library may already
  provide.
---

# k2bg-branding design reference

Rules for designing screens and components so they match the k2bg-branding design system. Every
visual value comes from a design token — reference the tokens and reuse the existing components
rather than inventing raw colors, spacing, or type.

## Core principle

Colors, spacing, radius, border width, and type are all defined as design-system tokens. Use the
token, never a raw hex or an arbitrary pixel value. Reuse existing components instead of rebuilding
them; only create something new when nothing in the library fits, and then match the existing
variant structure.

## Build with Figma's design-system features

Express a design through the file's own design-system features, the way the existing screens do —
this is what keeps it consistent and implementable:

- **Variables** — bind every color, spacing / gap, padding, radius, border width, and type value to
  a Figma Variable from the file's variable collections (color, size, typography). Do not hardcode a
  raw hex or pixel value, and do not detach a bound value; the existing components bind everything,
  so match them. Use the dedicated spacing variables for gaps (see Spacing).
- **Auto Layout** — compose frames with Auto Layout so padding and gaps are driven by the spacing
  variables and the design reflows like the built UI, rather than positioning elements absolutely.
- **Components & variants** — build reusable elements as components with variant properties and
  place instances; drive states (color / size / state …) through the variants instead of restyling.
- **Layout grid** — position content against the grid defined in the Layout Guide (see Grid &
  layout).

## Source of truth in code

The design system is defined in the repo, and the code is the durable reference — token names and
component APIs outlast any Figma node ID. The token sections below summarise the system; confirm
exact names, values, and props against these files, and design against what they define:

- **Design tokens** — `packages/tailwind-config/design-token/`: the W3C token file
  `design-tokens.tokens.json` (kept in sync with the Figma variables), plus `color.json` and
  `typography.json`. The CSS custom properties consumers actually use (`color.css`, `spacing.css`,
  `typography.css`, `variables.css`) are generated from these via Style Dictionary
  (`styleDictionaryConfig.js`). These files are the authority on which tokens exist and their values.
- **Components** — `packages/ui/src/components/`: the `ui` package, imported as
  `import { Button } from 'ui'`. Each Figma component maps to an implementation here (`Button`,
  `Form`, `Avatar`, `Icon`, …); read the component for its real prop / variant API before mirroring
  it in a design.
- **Component documentation (Storybook MCP)** — the `k2bg-design-system` MCP server (a Storybook
  instance) is the authoritative catalogue of every component's documented properties, variants, and
  examples. When you touch a component, query it (`list-all-documentation` to see what exists,
  `get-documentation` for a component's props and example stories) **before** relying on any
  property — never assume or invent a prop from naming conventions; if it isn't documented there, it
  likely doesn't exist. (`get-storybook-story-instructions` and `run-story-tests` support authoring
  and checking stories.)

A Figma design is ultimately built against these packages, so prefer their token names and component
props over anything ad-hoc, and flag any drift between Figma and code instead of silently diverging.

## Color tokens

Semantic groups (each has `light` / `default` / `dark` unless noted):

- `base/{white, light, default, dark, black}` — surfaces, borders, body text
- `main/{light, default, dark}` — brand (lime → teal); primary actions
- `accent/*`, and the status families `error/*`, `warning/*`, `info/*`, `success/*`
- `neutral/50`–`neutral/900` — greys for text, borders, and fills
- `white`, `black`

Typical usage: page background `base/white`; card surface `white`; borders and dividers
`neutral/200` (or `base/default` for inputs); primary action `main/default`; secondary text
`neutral/600`; title text `base/black`; errors `error/default`.

## Spacing

Two scales:

- **Semantic gap tokens** — `stack/condensed` (4) · `stack/normal` (8) · `stack/spacious` (16).
  Use these for the gaps between stacked, related elements.
- **The `base/*` ramp** — 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80 … for everything larger and
  for padding.

Rules:

- A gap of 4 / 8 / 16 → the matching `stack/*` token.
- A gap larger than 16 → the `base/*` ramp.
- Padding → the `base/*` ramp (e.g. inputs pad 8 / 12, cards pad 24).
- Prefer the whole steps (4 / 8 / 16 / 24 / 32 …); avoid the half-steps (6 / 10 / 14) unless visual
  balance genuinely needs them.

## Typography

Japanese text uses the `ja/*` type styles; Latin and code use the `en/*` styles. Scale
(size / line-height, in px):

- Heading (Bold): `heading/1` 30/48 · `heading/2` 24/39 · `heading/3` 20/32 · `heading/4` 18/29 ·
  `heading/5` 16/26 · `heading/6` 14/23
- Subtitle (Bold): `subtitle/lg` 24 · `subtitle/md` 22 · `subtitle/sm` 20
- Body: `body/r/lg` 18 · `body/r/md` 16 · `body/r/sm` 14 (Regular); `body/b/*` are the same sizes in
  Bold
- `caption` 12 (Regular)

Use Regular for body copy and Bold for headings and form labels. Page title → `heading/2`; card
title → `subtitle/sm` or `heading/3`; field label → `body/b/sm`; helper text → `caption`.

## Radius & border

- Radius: `border-radius/sm` 2 · `base` 4 · `md` 6 · `lg` 8 · `xl` 12 · `full` (pill / circle).
  Inputs and buttons use `md`; cards use `lg`; switches and avatars use `full`.
- Border width: `border/thin` (1) · `border/thick` · `border/thicker`. Apply the same weight on all
  four sides, and the same radius on all four corners.

## Grid & layout

- Follow the layout grid defined in the design system's Layout Guide — take its column count,
  gutter, and side margins as the source of truth instead of positioning elements with arbitrary
  values.
- Align content to the defined side margins, and align the gaps between sections and cards to the
  grid gutter, so a new screen lines up with the rest of the system.
- Reuse the spacing scale above for every gap and padding, so vertical and horizontal rhythm stays
  consistent.
- Design within the system's responsive breakpoints (desktop / tablet / mobile). When adding a
  responsive variant, follow how the existing screens reflow and stack at each breakpoint rather
  than inventing new behaviour.

## Component library — reuse, don't rebuild

The design system maintains a component library (implemented in `packages/ui/src/components/`).
Before building any UI element, check whether the library already provides it — if so, place an
instance and override only its content; never recreate the visual from scratch.

- Components expose their options through variant properties (such as color, state, and size). Pick
  the appropriate variant instead of restyling an instance by hand. Confirm the real, documented
  variants and props via the `k2bg-design-system` Storybook MCP rather than guessing.
- The library spans the usual layers — layout chrome, buttons, form fields and controls, display
  elements, and overlays. This set grows over time, so treat the live library as the source of
  truth rather than any fixed list.
- Build a new component only when nothing fits. **Name it after its React counterpart in
  `packages/ui`** — PascalCase, with dot-notation for compound components (e.g. `Form.Input`) — and
  name its variant properties after the React props (`variant`, `color`, `size`, `state`, …), so the
  Figma component and the code component read as the same thing. Give it the same variant structure
  and token bindings as the existing components, and add it to the library so it can be reused.

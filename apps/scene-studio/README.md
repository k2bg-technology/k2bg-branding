# scene-studio

Remotion Studio app for programmatic short-form videos ("scenes"). A video is
treated as *template + brand rules + assets + composition data* — compositions
are React components driven by props, rendered deterministically from frame
numbers.

Template design and naming rules live in
`.claude/rules/remotion-template-guidelines.md` (three-layer structure:
generic primitives → generic patterns → use-case compositions).

## Commands

```bash
pnpm -F scene-studio dev                  # Remotion Studio on http://localhost:3002
pnpm -F scene-studio render brand-demo    # render an MP4 to out/<composition-id>.mp4
pnpm -F scene-studio render visual-showcase --props=./data/visual-showcase.sample.json
pnpm -F scene-studio build                # bundle (webpack smoke test, outputs build/)
pnpm -F scene-studio lint                 # biome check
pnpm -F scene-studio typecheck            # tsc --noEmit
```

Rendered files (`out/`), bundles (`build/`), and media assets are gitignored.

## Structure

- `src/primitives/` — layer-1 generic video components (`VideoTitle`, `Caption`,
  `SafeArea`, `GradientOverlay`, `Logo`, `MediaFrame`, `BrandOutro`) plus the
  video typography theme (`video-theme.css`).
- `src/tokens/` — motion (frame-based durations, easings, springs) and
  safe-area tokens.
- `src/compositions/` — compositions registered in Studio, including one demo
  composition per primitive (`primitives` folder in the sidebar).
- `src/patterns/VisualShowcase/` — the layer-2, data-driven vertical media
  showcase pattern. Its schema-conforming sample input lives at
  `data/visual-showcase.sample.json`.

Layer rules live in `.claude/rules/remotion-template-guidelines.md`. The layers
are app-internal directories on purpose — extract one into a `packages/`-level
workspace only when a second workspace actually consumes it.

## Assets

Media files are **never committed**. Put local photos/videos into
`public/assets/` (gitignored, see the README there) and reference them via
`staticFile('assets/<file>')` or composition props. Remote `http(s)` URLs also
work but require network access at preview/render time.

## Rendering constraints

- **Local macOS only (for now).** Text uses the brand system-font stack
  (`--font-original`: Menlo / YuGothic / Hiragino…). Those fonts do not exist
  on Linux/CI hosts, so rendering elsewhere silently substitutes fonts.
  Revisit with `@remotion/google-fonts` if cloud rendering is ever needed.
- **Animations must be deterministic.** Derive all state from
  `useCurrentFrame()` / props. Never use `requestAnimationFrame`,
  `Math.random()` without a seed prop, or `new Date()`.

## Why webpack (and not Vite)

webpack is not this app's choice — it is Remotion's built-in toolchain.
`remotion studio`, `remotion render`, and `remotion bundle` all go through
`@remotion/bundler`, which bundles with webpack; `renderMedia()` only accepts a
serve URL produced by that bundler, so there is no supported Vite path.

The webpack usage is fully encapsulated in this app: no own webpack config, no
direct webpack dependency, and nothing leaks into the rest of the monorepo
(blog/portfolio stay on Turbopack, the ui Storybook stays on Vite). The single
touchpoint is the composable override in `remotion.config.ts`. If rendering
speed ever becomes an issue, try Remotion's experimental Rspack mode
(`--experimental-rspack`).

## Dependency policy

All `remotion` / `@remotion/*` packages must stay on **one identical exact
version** (no caret) across the monorepo — Remotion requires it. When
upgrading, bump every Remotion package together in a single commit.

## Future notes

- Three.js integration (`@remotion/three`) requires React Three Fiber 9.1.2+
  and three 0.171.0+ (React 19). The webpack override in `remotion.config.ts`
  is written as a composable function so additional overrides can chain onto
  `enableTailwind`.

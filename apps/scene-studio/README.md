# K2BG Scene Studio

A **Remotion** studio for data-driven short-form videos. Each video is defined
by a composition, brand rules, media assets, and validated props; its output is
deterministically derived from frame numbers. Part of the
[K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
| --- | --- |
| **Video** | Remotion, React, TypeScript |
| **Styling** | Tailwind CSS |
| **Validation** | Zod |
| **Testing** | Vitest, Testing Library |
| **Linting** | Biome |

## Getting Started

### Prerequisites

- Node.js 20.9+
- pnpm 10+
- macOS for local MP4 rendering (the brand system fonts are required)

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# From the monorepo root
pnpm -F scene-studio dev

# Or from this directory
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002).

### Render a Composition

```bash
# Render the brand demo to apps/scene-studio/out/brand-demo.mp4
pnpm -F scene-studio render brand-demo

# Render a data-driven showcase using its sample props
pnpm -F scene-studio render visual-showcase --props=./data/visual-showcase.sample.json
```

Rendered files (`out/`), bundles (`build/`), and local media assets are
gitignored.

### Build and Test

```bash
pnpm -F scene-studio build       # Bundle compositions to build/
pnpm -F scene-studio test        # Run once
pnpm -F scene-studio test:watch  # Watch mode
pnpm -F scene-studio lint        # Run Biome checks
pnpm -F scene-studio typecheck   # Run TypeScript checks
```

## Architecture

### Composition Layers

The app follows a three-layer video structure:

1. **Primitives** — generic visual building blocks such as `VideoTitle`,
   `Caption`, `SafeArea`, `GradientOverlay`, `Logo`, `MediaFrame`, and
   `BrandOutro`.
2. **Patterns** — reusable viewing structures such as `VisualShowcase`.
3. **Use-case compositions** — finished videos with a specific purpose. Add
   these only when a use case requires a structure that the generic patterns
   cannot express.

Template design and naming rules are defined in
[`.claude/rules/remotion-template-guidelines.md`](../../.claude/rules/remotion-template-guidelines.md).
The layers remain app-internal until another workspace needs to consume them.

### Registered Compositions

| Folder | Composition ID | Description |
| --- | --- | --- |
| `demo` | `brand-demo` | Brand typography and design-token demonstration |
| `primitives` | `primitive-*` | One Studio demonstration for each video primitive |
| `patterns` | `visual-showcase` | Validated vertical media showcase with captions, transitions, and brand outro |

### Data-Driven Rendering

`visual-showcase` uses `visualShowcaseSchema` to validate its props before
rendering. `calculateMetadata` derives the total frame count from item durations,
transition overlaps, and the outro so edits in Studio or JSON input update the
composition length automatically.

Animations must be deterministic: derive state from `useCurrentFrame()` and
props. Do not use `requestAnimationFrame`, unseeded randomness, or the current
time.

## Assets

Media files are **never committed**. Put local photos, videos, and audio in
`public/assets/` and reference them with `staticFile('assets/<file>')` or
composition props. The directory's [README](public/assets/README.md) explains
the local-asset workflow. Remote `http(s)` URLs also work, but previewing and
rendering them requires network access.

## Project Structure

```text
apps/scene-studio/
├── data/                         # Schema-conforming JSON input samples
├── public/assets/                # Gitignored local media files
├── src/
│   ├── compositions/             # Registered demo compositions
│   ├── patterns/                 # Layer-2 reusable video structures
│   │   └── VisualShowcase/
│   ├── primitives/               # Layer-1 reusable visual building blocks
│   ├── schemas/                  # Zod composition-prop schemas
│   ├── tokens/                   # Motion and safe-area tokens
│   ├── Root.tsx                  # Remotion composition registration
│   └── index.ts                  # Remotion entry point
├── remotion.config.ts            # Remotion and Tailwind configuration
└── vitest.config.mts             # Test configuration
```

## Toolchain and Dependencies

Remotion's Studio, renderer, and bundler use its built-in webpack integration.
The app has no standalone webpack configuration; `remotion.config.ts` only
composes the Tailwind override. The blog and portfolio remain independent of
this toolchain.

Keep every `remotion` and `@remotion/*` dependency on the same exact version.
When updating Remotion, update all of those dependencies together.

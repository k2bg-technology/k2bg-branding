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

1. **Primitives** — generic visual building blocks; see the
   [Primitive Inventory](#primitive-inventory) below.
2. **Patterns** — reusable viewing structures such as `VisualShowcase`.
3. **Use-case compositions** — finished videos with a specific purpose. Add
   these only when a use case requires a structure that the generic patterns
   cannot express.

Template design and naming rules are defined in
[`.claude/rules/remotion-template-guidelines.md`](../../.claude/rules/remotion-template-guidelines.md).
The layers remain app-internal until another workspace needs to consume them.

### Primitive Inventory

All Layer-1 primitives live in `src/primitives/` and are exported from
`src/primitives/index.ts`. Every primitive has a Studio demo composition named
`primitive-<kebab-case-name>`, and the fullscreen shader effects are also
collected as labeled segments in `shader-demo`
(see `src/compositions/ShaderDemo/scenes.ts`).

Effect primitives share these conventions: output derives only from
`useCurrentFrame()` and props, media sources are cover-fitted to the frame, and
the neutral endpoint (effect amount `0`, full coverage, or zero intensity)
renders an untouched passthrough so transitions can cross it invisibly.

#### Layout and brand

| Primitive | Description |
| --- | --- |
| `VideoTitle` | Animated headline with tone variants and a configurable entrance delay |
| `Caption` | Timed caption text with enter and exit animations |
| `SafeArea` | Padding container that keeps content inside platform-safe insets, with optional guides |
| `Logo` | Brand logo pinned to a corner with adjustable opacity |
| `MediaFrame` | Cover- or contain-fitted image/video frame with transform and start-offset control |
| `BrandOutro` | Closing brand card with configurable wordmark, call-to-action text, and social handle |
| `AccentLabel` | Small accent text mark with block, underline, or side-bar variants and a staged entrance |
| `TextReveal` | Text revealed per character or word with stagger, offset, and blur-in control |
| `TextScramble` | Text that settles from seeded glyph scrambling into the final string |
| `PanelGrid` | Bordered grid of media panels with staggered entrances (two to four panels intended) |

#### Atmosphere overlays

| Primitive | Description |
| --- | --- |
| `GradientOverlay` | Directional gradient scrim for legibility and mood |
| `FilmGrain` | Seeded photographic grain overlay |
| `ParticleDrift` | Slowly drifting field of seeded dust particles |
| `LightLeak` | Warm radial light washes drifting across the frame |
| `EdgeBlur` | Miniature-style defocus that blurs the frame's top and bottom bands |
| `Scanline` | CRT-style horizontal scanlines with optional downward drift |
| `HudOverlay` | Seeded instrumentation overlay of frame marks with an optional timecode readout |

#### Reveal effects

| Primitive | Description |
| --- | --- |
| `PaintReveal` | Transparent paint wash that covers the frame as coverage grows |
| `PaintSmear` | Warps its children into painterly smears; intensity `0` leaves them untouched |
| `ParticleReveal` | Dissolves its children into granular dust via a noise-thresholded alpha matte |

#### Transitions and timing

| Primitive | Description |
| --- | --- |
| `BlockWipe` | Flat-color band wipe whose coverage endpoints render nothing, hiding the cut at full coverage |
| `ExposureFlash` | Exposure burst that spans a hard cut and blows out to solid white at peak intensity |
| `OcclusionWipe` | Defocused foreground silhouette sweeping across the frame to mask a cut |
| `SpeedRamp` | Variable-speed video playback from a piecewise-linear speed curve, with ghost-frame smear above normal speed |

#### Media shaders (image and video sources)

| Primitive | Description |
| --- | --- |
| `WaveDistortion` | Sine-wave surface displacement with optional RGB shift and ripple center |
| `FluidDistortion` | Seeded fluid warp driven by fractal noise |
| `GridDisplacement` | Per-cell grid displacement with RGB separation |
| `GlitchShift` | Seeded glitch bursts combining band tears with a global RGB split |
| `Halftone` | Print-style halftone dots with size and angle control |
| `Duotone` | Two-color tone mapping between shadow and highlight colors |
| `Kaleidoscope` | Mirrored wedge segments with segment-count and rotation control |
| `DirectionalBlur` | Motion-blur smear along a fixed screen axis |
| `RadialBlur` | Radial zoom blur pulling toward the center |
| `TwirlDistortion` | Vortex swirl around a center point with falloff and optional channel spread |
| `HighlightBloom` | Overexposed-film bloom where highlights above a luminance threshold bleed outward |

#### Image shaders (image sources)

| Primitive | Description |
| --- | --- |
| `ChannelShift` | Opposing UV shift of the red and blue channels |
| `InvertBlend` | Color inversion blended in by amount |
| `Mosaic` | Screen-space mosaic cells that quantize the image |

#### Procedural shaders (no source media)

| Primitive | Description |
| --- | --- |
| `GradientFlow` | Flowing full-screen color gradient |
| `SignalNoise` | Full-screen white-noise static |

#### 3D and post-processing

| Primitive | Description |
| --- | --- |
| `DepthGallery` | Camera dolly through depth-staggered image planes |
| `DepthParallax` | Depth-map-driven parallax sway and dolly zoom over a still image, with focus-aware blur |
| `PostFxStage` | Stage that finishes a hosted 3D scene with composer effects (bloom, depth of field) |

### Registered Compositions

| Folder | Composition ID | Description |
| --- | --- | --- |
| `demo` | `brand-demo` | Brand typography and design-token demonstration |
| `demo` | `shader-demo` | Shader effect showcase with one labeled segment per effect primitive |
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

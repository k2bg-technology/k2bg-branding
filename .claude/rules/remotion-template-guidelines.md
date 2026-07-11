---
paths: apps/scene-studio/**/*,packages/scene-ui/**/*
---

# Remotion Template Design & Naming Guidelines

How to decide the granularity and names of Remotion templates, compositions, and
components in the video platform (`apps/scene-studio`, `packages/scene-ui`). <!-- docs-check-ignore: scene-ui lands in #381 --> These
rules are use-case-agnostic: they apply equally to travel videos, AI-generated
graphics, 3D works, tech explainers, blog-to-video, and brand/product intros.

Do not fix a definitive template list or final package layout up front. Build real
videos, observe actual duplication, and evolve the design incrementally.

## Three-layer structure

```
Layer 1: generic primitives     — small video parts (scene-ui)
        ↓
Layer 2: generic patterns       — video structures reusable across use cases
        ↓
Layer 3: use-case compositions  — finished videos with a fixed purpose
```

### Layer 1 — generic primitives

Small building blocks: `VideoTitle`, `Caption`, `SafeArea`, `GradientOverlay`,
`Logo`, `MediaFrame`, `BrandOutro`, transitions. **Never** encode a use case,
material, or platform in a primitive's name — no `TravelTitle`, `ArtworkCaption`,
`InstagramLogo`. Primitives must work for every video genre.

### Layer 2 — generic patterns

Structures reusable across use cases, named after the **structure or viewing
experience**, not the material: `VisualShowcase`, `MediaSequence`, `BeforeAfter`,
`NarratedSequence`. `VisualShowcase` works for travel photos, AI images, 3D works,
portfolio pieces, product shots alike.

### Layer 3 — use-case compositions

Finished videos with a clear purpose: `TravelHighlight`, `ArtworkReveal`,
`BlogSummary`, `ProductFeature`. The name tells viewers-facing intent.
**Do not create these up front.** Run layer-2 patterns with different real
materials first; split into a use-case composition only when a use case
repeatedly needs its own structure (e.g. travel always needs place + map,
AI artwork always needs prompt + process).

## Naming rules

- Names express **structure / role / viewing experience**, never the material
  type (`TravelVideo`, `PhotoVideo` → bad) or the implementation technology
  (`ThreeJsVideo` → bad; `ThreeIntro`, `ParticleReveal` → good).
- No `Template` suffix (`VisualShowcaseTemplate` → bad). A `templates/` or
  `patterns/` directory already says it. Use suffixes only to disambiguate
  colliding roles in one domain (`…Input` vs `…Preview`).
- Composition IDs: kebab-case, unique, readable by humans, the CLI, and logs
  (`visual-showcase`, `brand-demo`). Avoid `template-1`, `main-video`,
  `test-video`, `final-video`.
- No platform names in compositions (`instagram-video`, `tiktok-template` → bad).
  Platform differences are props/variants (aspect ratio, safe-area preset),
  not separate compositions.

## No universal templates

Do not build a schema that can express "any video" (scene lists with free-form
`type` / `layout` / `component` strings and `z.record(z.unknown())` props). That
is a DSL, not a template: weak types, unstable AI output, untestable. Constrain
each schema to one structure (e.g. `visualShowcaseSchema` = title + items with
`mediaType`/`src`/`caption`). Extend from real requirements when expressiveness
runs out.

## Abstraction criteria

Commonize when: the same structure appears 3+ times; the same change/bug-fix hits
multiple compositions; the same layout or animation serves multiple use cases;
brand changes need a single point of application.

Do not rush when: requirements are still vague; something is used once; "might
need it later"; commonizing forces prop bloat or many booleans switching
behavior; story structure genuinely differs per use case. A component like
`<GenericVideo isTravel showPrompt={false} useThreeJs …>` is the signal to split
into use-case compositions.

Decision flow for a new video:

1. Can an existing composition express it? → add props / input data only.
2. Can existing generic patterns be combined? → create just a new composition.
3. Would a new generic pattern serve multiple use cases? → add the pattern.
4. Otherwise → implement inside a use-case composition; revisit commonization
   when the same structure recurs.

## AI agents and templates

Humans/code own: available compositions and primitives, schemas, brand rules,
display limits, safe areas, output specs. AI agents own: choosing a composition,
generating schema-conforming input data, ordering materials, writing captions,
tuning display times, picking allowed variants. Default flow is *AI selects an
existing composition → generates valid input JSON → renders*. AI-generated
composition code is allowed only for experiments and requires human review
before it joins the stable set.

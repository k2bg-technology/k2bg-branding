# Modern CSS Adoption

## Adoption Criterion: Baseline

Judge features by their **Baseline** status (shown on MDN and caniuse), not by remembered version tables:

The supported browsers are the Baseline Widely available set; no `browserslist` narrows it. Tailwind v4's own minimum (its output relies on cascade layers, `@property`, and `color-mix()`) reaches back to older browser releases than that set does, so a feature Tailwind compiles is not thereby supported — check each feature's Baseline status itself.

- **Widely available** → use freely; replace the legacy pattern in code you are already changing, not across untouched files.
- **Newly available** → gate with `@supports` and provide a graceful fallback.
- **Limited availability** → do not ship without an explicit project decision.

Check MDN or caniuse at decision time rather than trusting memory — support only moves forward, so a feature remembered as risky is frequently Widely available.

## Replacement Guide

When touching code that uses a legacy pattern, prefer the modern equivalent:

| Legacy pattern                                                | Replace with                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Component styles switched by viewport media queries           | `@container` queries on the component                           |
| Manually re-declared column widths in nested grids            | `grid-template-columns: subgrid`                                |
| Padding-top percentage hack for ratios                        | `aspect-ratio`                                                  |
| Margins between flex/grid children                            | `gap` on the container                                          |
| JS scroll hijacking for carousels and pagers                  | `scroll-snap-type` / `scroll-snap-align`                        |
| JS scroll listeners re-pinning a header                       | `position: sticky`                                              |
| JS class toggling to style a parent from a child's state      | `:has()`                                                        |
| Repeated selector lists                                       | `:is()` (or `:where()` for zero specificity)                    |
| Physical `margin-left` / `text-align: left` in i18n-facing UI | Logical properties (`margin-inline-start`, `text-align: start`) |
| `(min-width: …)` / `(max-width: …)` media queries             | Range syntax: `@media (width >= 48rem)`                         |
| `100vh` for a full-height element                             | The root `height: 100%` chain; `svh`/`dvh` where a viewport unit is justified (see `layout.md`) |
| A dark block re-declaring every semantic color token          | `light-dark(light, dark)` in each token, driven by `color-scheme` |
| JS FLIP animations for page or DOM transitions                | View Transitions API                                            |

## Usage Notes

- **Container queries**: declare `container-type: inline-size` on the wrapper being measured (the `@container` utility); query with `@container (width >= …)` or the `@md:` variants. This is the primary tool for component-level responsiveness (see `layout.md`).
- **`light-dark()`**: resolves by the `color-scheme` that applies to the element using it, so a page-wide theme sets `color-scheme` on `:root` (and per explicit theme), while a scoped widget may set its own; see `tokens-and-theming.md` for the pattern it replaces.
- **`:has()`**: prefer it for parent/sibling state styling (`label:has(input:invalid)`), not as a general traversal language; keep the inner selector simple — complex `:has()` chains are both slow and unreadable.
- **Logical properties**: default to them in any codebase with RTL or vertical-writing prospects; in a strictly LTR product they are optional, but never mix physical and logical idioms on the same axis in one component.
- **`@supports`**: gate Newly-available features so the fallback is explicit and testable: `@supports (grid-template-columns: subgrid) { … }`.
- **`@layer`**: Tailwind v4 already orders `theme`, `base`, `components`, and `utilities` in cascade layers. Global base rules go in `@layer base` (as `packages/ui/src/globals.css` does) so utilities override them; unlayered CSS beats every layer, so a CSS Module rule wins over a utility on the same element regardless of specificity — do not mix a utility and a module rule for the same property on one element.

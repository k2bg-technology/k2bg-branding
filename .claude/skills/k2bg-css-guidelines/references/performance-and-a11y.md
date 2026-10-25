# Performance and Accessibility

## Animation

- **Animate only `transform` and `opacity`.** They run on the compositor without relayout or repaint. Animating `top`/`left`/`width`/`height`/`margin` forces layout every frame and stutters.
- Move with `transform: translate()`, scale with `transform: scale()`; when an element must animate between sizes, prefer a transform (FLIP technique) over animating the box itself.
- `will-change` is a last resort for measured jank, applied narrowly and removed afterwards — not a blanket optimization.
- Keep transitions specific: `transition: opacity 150ms ease` (`transition-opacity`) — never `transition: all` (`transition-all`), which animates properties you did not intend and taxes every style change.

## Rendering Cost

- Long lists, feeds, and off-screen article sections: `content-visibility: auto` plus `contain-intrinsic-size` lets the browser skip rendering off-screen content while keeping scrollbars stable.
- Self-contained widgets that update often: `contain: layout paint` isolates their layout and paint so updates cannot ripple through the page.
- Both change how size and overflow behave — apply them deliberately to identified hot spots, never globally.

## Motion Accessibility

Every non-trivial animation needs a reduced-motion path. With utilities, gate motion with `motion-safe:` (`motion-safe:animate-in`) or neutralize it with `motion-reduce:`; in a CSS Module, add a `@media (prefers-reduced-motion: reduce)` block inside the animated rule. A site-wide kill switch takes this form:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This global kill switch is the sanctioned `!important` use — it must beat everything by design. Each animation then runs once and settles at the state its `animation-fill-mode` gives it, so check that end state for animations that were infinite or that hide content until they run. When motion carries meaning (a progress indicator, a state change), replace it with a non-motion cue instead of merely removing it.

## Focus and Interaction

- Every interactive element keeps a visible focus style. Style `:focus-visible` (`focus-visible:`) rather than suppressing `:focus`; never `outline: none` without a replacement of equal visibility. The base layer of `packages/ui/src/globals.css` resets form controls with `outline-hidden`, so every input, button, textarea, and select component supplies its own `focus-visible:` style.
- Draw focus rings and component boundaries with `outline` and `border`, not with `background` or `box-shadow` alone. Forced-colors mode (Windows high contrast) removes backgrounds and shadows and recolors borders and outlines with system colors, so a ring drawn as a shadow (Tailwind's `ring-*`) disappears there; `outline: 2px solid transparent` on a shadow-based ring keeps a visible ring in forced colors — Tailwind's `outline-hidden` hides the outline but emits that transparent outline under forced colors, while `outline-none` removes it entirely. Adjust what remains under `@media (forced-colors: active)` with system colors (`CanvasText`, `Highlight`, `ButtonText`) instead of palette tokens.
- Respect the user's text size: `rem`-based type and media queries (see `units-and-sizing.md`) are an accessibility requirement, not a preference.
- Padding on an interactive element enlarges its hit target; a margin does not — one more reason spacing inside interactive components is padding's job.
- `display: contents` drops some elements' semantics in some browsers; verify before using it on interactive or landmark elements.

## Loading

- Keep global stylesheets lean; component styles ship with their component (utilities and CSS Modules do this by construction).
- `@import` in the global stylesheets (`app/globals.css` → `packages/ui/src/globals.css` → the token files) is inlined at build time by Tailwind and Next.js; do not add `@import` of remote stylesheets, which the browser fetches serially.

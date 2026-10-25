# Layout

Build every layout with Flexbox or Grid in normal flow. Positioning schemes, stacking, and breakpoints are escape hatches, not defaults — the less a layout depends on them, the cheaper it is to maintain.

## Choosing Flexbox or Grid

| Situation                                                                                       | Use                                         |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Items flow along one axis and size themselves by content (toolbar, nav, tag list, button row)   | Flexbox                                     |
| The container defines a two-dimensional structure (page shell, card grid, form grid, dashboard) | Grid                                        |
| Nested children must align to the parent grid's tracks                                          | Grid + `subgrid`                            |
| Text wraps around an image                                                                      | `float` (its one legitimate use)            |

- Prefer the simplest tool: a single row of items is a flexbox, not a one-row grid.
- Never lay out with `float` or `inline-block` — they need clearfixes and whitespace hacks and break under content changes.
- `position: absolute` is for overlay elements only (badge on an avatar, dropdown panel, tooltip). If the element participates in the page's flow, keep it in flow — absolutely positioned layouts break the moment content changes size.

## Overflow in Flex and Grid Children

Flex items and grid items default to `min-width: auto`, so a child holding long text, code, a table, or an unbreakable string refuses to shrink below its content and pushes the page wider instead of wrapping.

- Give any flex or grid child that holds running text, code, or a table `min-width: 0` (`min-w-0`), so it is allowed to shrink; wrapping or scrolling of the content inside is then a separate declaration (`overflow-wrap`, or `overflow-x: auto` on the wide element's wrapper). `overflow: auto`, `scroll`, or `hidden` on the child also lifts the automatic minimum, but `overflow: clip` and `visible` do not.
- In grid tracks, `minmax(0, 1fr)` instead of a bare `1fr` sets the same floor on the track itself.
- Unbreakable strings (URLs, hashes, long identifiers) wrap with `overflow-wrap: anywhere` on the text element.
- Only tables, code blocks, and diagrams may be wider than their container, each inside its own `overflow-x: auto` wrapper; the page body never scrolls horizontally.

## Spacing Ownership

The single most effective rule for reusable components:

- **A component never sets its own outer margin.** The parent that arranges children decides the space between them, with `gap`.
- **`gap` for space between siblings** in any flex or grid container. It cannot collapse, cannot double up at row ends, and lives in one place.
- **`padding` for space inside a box** — between a container's edge and its content. Padding sits inside the border, so it also carries the background and enlarges the click target; that is what makes it right for insides and wrong as a blind margin replacement.
- **`margin` is allowed in exactly two places**: flow prose rhythm in long-form text (`.article p + p { margin-block-start: 1rem; }`) and the `margin: auto` family for pushing an item within its container (`margin-inline-start: auto` to end-align one flex child, `margin: auto` to center).

Do not mechanically rewrite margins into paddings — they are different boxes. Restructure so the spacing intent moves to `gap` on the parent.

## Stacking and z-index

Avoid `z-index`. Most overlap problems are DOM-order problems: later elements paint above earlier ones, and any positioned element with `z-index` starts a stacking context.

- A stacking context is also created by `transform`, `filter`, or `backdrop-filter` with any value other than `none`, `opacity` below 1, `will-change` naming one of those properties, `contain: paint`, and `isolation: isolate`. A `z-index` that "does not win" is almost always trapped under one of these on an ancestor — find that ancestor before raising the value.
- First try reordering the DOM or removing an unnecessary `position`.
- Contain intentional internal stacking with `isolation: isolate` (`isolate`) on the component root, so it cannot leak into or fight the rest of the page.
- Only dedicated layer components (modal, dropdown, toast, sticky header) may set `z-index`, and only via a tokenized scale defined in one place — the `@theme` block of `packages/ui/src/globals.css`, added there with the first layer component that needs it. Use Tailwind's z-index namespace (`--z-index-dropdown`, `--z-index-modal`, `--z-index-toast` → `z-dropdown`, `z-modal`, `z-toast`); a name outside it generates no utility. Never a literal `999` or `z-[999]`. Overlays built on a headless library's portal inherit stacking from DOM order first; add a layer token only when order alone does not settle it.

## Full-Height Layouts

Size full-height layouts from the root with a percentage chain, not with viewport units scattered through the tree. `packages/ui/src/globals.css` already sets it in its base layer (`html` and `body` get `h-full`, preflight sets `body { margin: 0 }`), and every app imports that file:

```css
html,
body {
  height: 100%;
}
```

- `height: 100%` on `html` resolves against the initial containing block, which every engine sizes to the small viewport (browser UI expanded). It therefore equals `100svh`: stable while the toolbar hides and shows, and never clipped behind it.
- The chain has two preconditions. `body` has `margin: 0` (a reset does this), or the default margin adds a scrollbar to every page. The page background is set on `body` (in an app's `app/globals.css` or its root layout's `body` classes) and `html` keeps none, so the background propagates to the canvas; a background on `html` stops that propagation, and `body`'s background then ends at the viewport edge while the content scrolls on below it.
- Below `body`, the page root chooses its mode. A scrolling document uses `min-height: 100%` (`min-h-full`) and distributes space with flex or grid (header / `1fr` / footer); its content grows past the viewport, and the document scrolls as usual. An app shell uses `height: 100%` and `overflow: hidden` (`h-full overflow-hidden`); each scrolling region owns its own `overflow: auto`, and the flex or grid children containing it carry `min-height: 0`.
- A percentage `height` resolves only against a containing block whose height is definite. Definite: an ancestor with an explicit height (`height: 100%` down the chain); a grid item stretched in the block axis (the default `align-self`) or given its own definite height, because a laid-out grid area counts as definite whenever its row track is (`400px`, or `1fr` in a definite-height grid), even when the grid container's own height is `auto` — an item with `align-self: start` and `height: auto` is content-sized and its percentage children resolve to `auto`; a flex item whose flexed main size is definite — in a column container, the container has a definite height or the item has a definite flex basis (`flex: 1 1 0`), and in a row container, a stretched item in a definite-height container. Not definite: `min-height` alone, an ancestor sized only by its content, and a column flex item with `flex-basis: auto` in an auto-height container (column stretch fixes width, not height). So a scrolling document grows through flex/grid space distribution, and `height: 100%` descendants belong where the chain above them is definite, which the app-shell mode guarantees. A framework wrapper or portal root between `body` and the shell breaks the chain; size that wrapper, do not switch the descendant to a viewport unit.
- Viewport units are for an element that must track the viewport independently of its ancestors (a hero inside a scrolling document). Use `svh` for a stable size and `dvh` when the element must follow the toolbar; never `vh` (Tailwind's `h-screen` / `min-h-screen`), which equals the large viewport on mobile and overflows by the toolbar's height. Inside a tree the root chain already sizes, `svh` agrees with the chain while `dvh` and `vh` exceed it whenever the toolbar is retracted, so do not mix those two in.
- With the default viewport behavior only the visual viewport shrinks for the virtual keyboard, so neither `100%` nor `dvh` changes. `interactive-widget=resizes-content` in the viewport meta (Chrome on Android) and some WebView settings shrink the layout viewport instead, which changes both. Check which mode the page runs in before compensating for keyboard height in JavaScript; compensating on top of a layout viewport that already shrank subtracts the keyboard twice.

## Sticky and Fixed

- `position: sticky` for elements that follow scroll but belong to the flow (section headers, table headers, sidebars). It keeps layout intact where `fixed` would tear the element out.
- `position: fixed` only for viewport-level chrome (modal backdrop, toast region).
- Sticky fails silently when an ancestor sets `overflow: hidden`/`auto` or the sticky element fills its container — check ancestors before debugging further.

## Responsive Strategy

Aim for layouts that need no breakpoints, then add the few that remain.

1. **Fluid first**: `flex-wrap`, `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`, `clamp()` for type and spacing, intrinsic `min-content`/`max-content` sizing.
2. **Container queries second**: when a component must rearrange by its own width, use a container query (`@container` on the wrapper, `@md:` variants on the children) — the component stays correct wherever it is placed.
3. **Media queries last**: for page-level rearrangement only. Use Tailwind's breakpoint variants (`md:`, `lg:`), which are already mobile-first and `rem`-based; in a CSS Module, write them in `rem` with range syntax: `@media (width >= 48rem)`. Never use `max-*:` variants to undo a mobile-first style — restructure so the base style is the narrow one.

Every breakpoint is a maintenance liability; each one avoided is a class of bugs never shipped.

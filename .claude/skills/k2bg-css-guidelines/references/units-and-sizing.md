# Units and Sizing

## Box Sizing

Applied once, globally, by Tailwind's preflight (loaded from `packages/ui/src/globals.css`); never re-declare it per component:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

With `border-box`, `width`/`height` include padding and border, so a `width: 200px; padding: 20px` box is 200px wide — sizes mean what they say. Leave `content-box` for the rare third-party embed that expects it.

## Unit Choice

| Value                                                            | Unit                      | Why                                                                                                  |
| ---------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Font sizes                                                       | `rem`                     | Follows the user's browser font-size setting; `px` fonts ignore it (accessibility failure)           |
| Media query thresholds                                           | `rem`                     | Breakpoints must move with the user's font size, or enlarged-text users get desktop layouts squeezed |
| Spacing (padding, gap)                                           | `rem`, via spacing tokens | Keeps rhythm proportional to type; the token layer makes the physical unit an implementation detail  |
| Borders, hairlines, fine shadows                                 | `px`                      | A 1px line should stay 1px; scaling it produces blurry or heavy lines                                |
| Icon size, marker offset — anything that must track its own text | `em`                      | Scales with the local font size of the element                                                       |

Never set `font-size` on `html`/`:root` in `px` — it overrides the user's preference globally.

## Fluid Values

- `clamp(min, preferred, max)` for fluid type and spacing: `font-size: clamp(1rem, 0.9rem + 1vw, 1.5rem)`. Keep a `rem` term in the preferred value so browser zoom and font-size settings still work.
- `min()`/`max()` for container widths: `width: min(100%, 60rem)`.

## Aspect Ratio

Use `aspect-ratio` for media boxes and embeds; delete padding-top percentage hacks on sight:

```css
.thumbnail {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

## No Magic Numbers

A magic number encodes an accident of today's content: a fixed `height: 46px` matching one line of text, a `margin-top: 3px` nudging something into alignment, a `width: 387px` matching one screenshot.

- **Never fix heights on text-bearing elements.** Content, translations, and user font sizes change; fixed heights clip or overflow. Use `min-height` if a floor is needed; otherwise let content size the box.
- If two things must align, align them with the layout (same grid row, `align-items`), not with compensating offsets.
- If a specific value is genuinely required (matching an external asset or a spec), name it as a token or comment its origin so the next reader can re-derive it.

## Arbitrary Values

A Tailwind arbitrary value (`h-[200px]`, `w-[37.5rem]`, `mt-[3px]`) is a raw literal written inside a class name; it follows every rule above.

- Reach for the theme scale first: `p-3`, `gap-6`, `text-body-r-sm`, `rounded-md`. An arbitrary value that equals a scale step is a token bypass.
- Sizing a container is the legitimate use (`max-w-[50rem]`, `w-[min(100%,60rem)]`); a fixed `h-[…]` on an element that holds text is a magic number.
- Keep the unit rules: `rem` for sizes and type, `px` only for hairlines.
- When the same arbitrary value appears in more than one component, it is a missing token — add it to the token layer (see `tokens-and-theming.md`).

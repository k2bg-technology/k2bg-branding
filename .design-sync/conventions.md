## Building with this design system

Components are the real `ui` React library on `window.K2bgUi`. Link `styles.css`
once (it `@import`s the tokens + compiled component CSS) and mount into a
dedicated node so the trees don't collide:

```jsx
const { Button, Avatar, Dialog } = window.K2bgUi;
ReactDOM.createRoot(document.getElementById('ds-root')).render(
  <div className="flex flex-col gap-normal p-spacious bg-base-white">
    <h2 className="text-heading-2 text-base-black">Profile</h2>
    <Avatar />
    <Button color="main" variant="default" size="default">Save</Button>
  </div>,
);
```

No provider/theme wrapper is required — components are styled by the linked
stylesheet, not React context. (The repo's Storybook adds an i18n decorator, but
no shipped component consumes translations.)

### Two styling levers

1. **Component props** — components carry the design language through typed
   props; do NOT restyle them with utility classes. Example: `Button` takes
   `color` (`main` | `accent` | `success` | `error` | `info` | `warning` |
   `dark` | `light` | `inherit`), `variant` (`default` | `outline` | `ghost`),
   `size` (`default` | `sm` | `lg` | `icon`). Read each
   `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts` for that
   component's real prop names before composing it.

2. **Tailwind v4 utilities for YOUR layout glue** — this DS ships a Tailwind v4
   preset; style the wrappers/spacing around components with its token-backed
   classes (never invent hex/px). Verified families:
   - color: `bg-base-white` `bg-base-black` `bg-base-default` `bg-main-default`
     `bg-accent-default` `bg-error` `bg-success`; text equivalents
     `text-base-black` `text-main-default` `text-accent-default` `text-error`.
   - spacing (semantic ramp): `gap-condensed` `gap-normal` `gap-spacious`,
     `p-condensed` `p-normal` `p-spacious` (4 / 8 / 16px).
   - typography: `text-body-{r,b}-{sm,md,lg}` (r = regular, b = bold),
     `text-heading-1`…`text-heading-4`, body font `font-original`.
   Standard Tailwind utilities (`flex`, `grid`, `rounded-md`, `w-full`…) also
   resolve.

### Where the truth lives

- `styles.css` and its `@import` closure (incl. `_ds_bundle.css`) — the
  authoritative tokens and component CSS. Read it before styling.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage + variants;
  `<Name>.d.ts` — exact prop types. Groups: `components/` and `media/`.
- Raw design tokens are CSS custom properties — `var(--color-*)`,
  `var(--spacing-condensed|normal|spacious)`, `var(--radius-*)`,
  `var(--typography-*)` — names preserved verbatim from upstream.

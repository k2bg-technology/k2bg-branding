# Composition

## Compound Components or Slots

Use compound components when consumers arrange, omit, or repeat independently meaningful parts. For example, a `Card` exposes `Card.Header`, `Card.Title`, `Card.Description`, and `Card.Content`. Keep each part in its own file and assemble with `Object.assign(Root, { ...parts })`.

Use slot props when the wrapper owns a fixed hierarchy and lifecycle. For example, a dialog wrapper owns its trigger, portal, backdrop, popup, title, description, and close control; consumers supply `trigger` and `content`. Follow the slot contract in [API design](api-design.md).

Set each part's `displayName` to its public name, such as `Card.Content`. Put stable `data-slot` names on rendered DOM parts, such as `card-content` for a card's content part. A headless Root that renders no DOM does not acquire a wrapper solely for a `data-slot`.

## Element Replacement

Use the wrapped Base UI primitive's `render` prop, never `asChild`. Preserve the primitive's event handling, ref, and semantic contract when supplying the rendered element. Avoid nested buttons and links.

For example, a popover trigger renders a generic `Button` with an accessible name and a decorative `SearchIcon`:

```tsx
<Popover.Trigger
  render={
    <Button aria-label="Open search">
      <SearchIcon aria-hidden="true" />
    </Button>
  }
/>
```

Trigger wrappers forward the primitive's props. A dialog wrapper uses the same replacement mechanism for its trigger and close control. For navigation styled as a button, apply `buttonVariants` to an anchor or `Link`.

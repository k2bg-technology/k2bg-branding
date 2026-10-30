# State and Headless Behavior

## Base UI Wrappers

Wrap `@base-ui/react` for interactive primitives. Keep its keyboard handling, focus management, ARIA relationships, and state model intact. Use the documented primitive props instead of reproducing those behaviors with local event handlers.

For example, a popover wrapper forwards Root props, and a selection wrapper preserves Base UI's value and multiple-selection generics. Preserve that type information rather than widening values or adding casts. Element replacement uses `render` as described in [Composition](composition.md).

## Controlled and Uncontrolled State

Expose both modes through the Base UI Root contract. For open state, preserve `open`, `defaultOpen`, and `onOpenChange`; for value state, preserve the primitive's value, default-value, and change-callback props. Controlled state comes from the consumer. Uncontrolled state uses the primitive's default props. Do not mirror controlled props into a second local state or replace Base UI's change callback with an incompatible signature.

For example, a dialog wrapper extends `DialogPrimitive.Root.Props` and forwards the remaining props to its Root. A selection wrapper supports uncontrolled selection with `defaultValue` and `items`.

Keep local state at the smallest interactive component that owns it. Shared application state and server-state libraries follow `AGENTS.md`, "State Management"; fetching and cache policy follow [Data and caching](data-and-caching.md).

## Navigation and Transient State

With Cache Components, Next.js uses React `<Activity>` to preserve recently visited route state. Hidden routes clean up effects and recreate them when visible; navigation does not imply unmounting or resetting state.

Keep drafts and intentional view state. Explicitly reset transient dropdown/dialog open state and stale submission messages when their lifecycle requires it. Use the per-pattern cleanup and event-handler guidance in `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`; do not depend on unmount alone.

# Placement and Structure

## Ownership

Domain-independent parts belong in the components directory of `packages/ui`, including charts, tables, and other visualizations. Domain-specific assembly belongs in each app's components directory, in kebab-case subdirectories. Each app's App Router directory owns routing and composes those components.

Use the naming rules in `AGENTS.md`, "File & Directory Naming". Each component file holds one component. Co-locate its stories, tests, and component-specific hooks; story content follows `k2bg-storybook-docs`, and test scope follows `.claude/rules/unit-test-guidelines.md`.

Generic placement examples:

- A card content part: reusable visual part in `packages/ui`.
- A chart primitive: domain-independent visualization in `packages/ui`.
- A contributor badge: app-specific contributor presentation in the app.
- A dashboard section that renders a chart and a screen-reader table: domain-specific assembly in the app.

## Splitting and Exports

A compound component has `Root.tsx`, one file per part, and an `index.tsx` that assembles the public API with `Object.assign`. For example:

```tsx
const Card = Object.assign(Root, {
  Header,
  Title,
  Description,
  Content,
});

export { Card };
```

Expose shared components through the `ui` package's public entry point; consumers import from `ui`. General import/export rules stay in `AGENTS.md`, "Import / Export Patterns". Component parts use `displayName` matching the public dot notation.

Page and layout files define no component other than the default export. Extract rendered subcomponents to the app's components directory. Framework exports such as `metadata`, `generateMetadata`, and compatible route configuration remain in route files. Function extraction follows `.claude/rules/code-style.md`, "Inline Needless Functions". Do not add functions that only pass arguments through in order to split a file.

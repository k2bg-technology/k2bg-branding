# App Components

## Compose From `ui` First

Consult `k2bg-figma-design` for the existing library and tokens, and inspect the `ui` package's public exports. Confirm the chosen component's props in its Storybook documentation or stories before use. Import shared components from `ui`.

Use shared controls, tables, charts, and other parts instead of rebuilding them with raw `<button>` or `<table>` elements. When a part is missing, first consider a domain-independent addition to `packages/ui`. Only domain-specific components and assembly belong in an app.

For example, an app navigation region composes shared buttons, drawers, menus, icons, and popovers. A contributor badge adapts app-specific contributor data to a shared avatar. Domain-independent chart parts live in `packages/ui` rather than dashboard modules.

## Raw Markup and Custom Styling

Raw layout and prose elements remain appropriate. Raw controls or custom visual parts are appropriate only when `ui` cannot express the requirement, such as markup emitted by rendered Markdown or an external widget. For example, a rendered article's embedded widget can supply markup outside the shared component API. Reuse the design tokens and follow `k2bg-css-guidelines` even when the markup originates elsewhere.

Keep domain data loading and app-specific decisions outside shared presentation primitives. General function splitting follows `.claude/rules/code-style.md`; error translation follows `.claude/rules/error-handling-guidelines.md`; Portfolio dictionary ownership follows `.claude/rules/portfolio-i18n-guidelines.md`.

Review app component changes for a re-implementation of a part that exists in `ui`, unsupported component props, or domain-independent behavior placed in an app.

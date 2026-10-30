---
name: k2bg-component-guidelines
description: Component structure and API rules for k2bg-branding — placement, props, composition, Base UI wrappers, state, accessibility, and Next.js page conventions. Use when writing, modifying, or reviewing packages/ui components, web app components, or App Router page, layout, loading, error, and not-found files. Complements k2bg-css-guidelines; Scene Studio video primitives are outside its scope.
---

# k2bg Component Guidelines

This skill owns component shape across the shared UI package, web app components, and App Router files. Read the reference matching the task before editing.

## Core Rules

- Place domain-independent reusable components, including visualizations, in `packages/ui`; app-specific components live in each app's components directory, in kebab-case subdirectories. Each component file holds one component. Page and layout files define only their default component.
- Use `interface Props`, extending the rendered element's or Base UI primitive's props. Forward `...rest`, accept refs as normal props, and merge caller `className` last with `cn()`. Do not accept values derivable from another prop.
- Split compound components into `Root.tsx`, part files, and an `index.tsx` assembled with `Object.assign`. Use dot notation, `displayName`, and stable `data-slot` attributes on rendered parts.
- Choose compound parts when consumers arrange the structure; choose slot props when the wrapper owns a fixed structure. Slot prop types admit only values the component renders: behavior slots use `ReactElement`; display-only slots use `ReactNode` and render what they receive.
- Wrap `@base-ui/react` for headless behavior. Use its `render` prop for element replacement, and pass Root props through for controlled and uncontrolled state.
- Use CVA for variants; export the variant function when anchors or Next.js `Link` share a component's appearance.
- Compose app UI from `ui` first. Consider a reusable addition to `ui` before building a missing domain-independent part in an app.
- Preserve semantic roles, accessible names, keyboard behavior, and focus management through composition.
- Follow the Rules of React; leave memoization to React Compiler — no `useMemo`, `useCallback`, or `memo`.
- Keep pages and layouts as Server Components; place `'use client'` on interactive leaves. Props crossing to Client Components use React's serializable types.
- Type route entry points with generated `PageProps<'/route'>` and `LayoutProps<'/route'>`; await `params` and `searchParams`. Layouts do not read query parameters.
- Cache Components is the standard for compatible deployments: explicitly enable `cacheComponents` and `partialPrefetching`, cache selected reads with `'use cache'`, and isolate request-time reads under Suspense. Apps with Cache Components disabled retain classic caching configuration and app-specific rules in `AGENTS.md`.

## Reading Map

| Task | Read |
| --- | --- |
| Placement, splitting, filenames, exports | [Placement and structure](references/placement-and-structure.md) |
| Naming components, hooks, props | [Naming](references/naming.md) |
| Props, slots, refs, variants, class merging | [API design](references/api-design.md) |
| Compound components, slot props, `render`, `data-slot` | [Composition](references/composition.md) |
| Base UI wrappers, controlled and uncontrolled state | [State and headless behavior](references/state-and-headless.md) |
| Semantics, names, keyboard, focus | [Accessibility](references/accessibility.md) |
| Render purity, immutability, hooks, memoization | [React rules and memoization](references/react-rules.md) |
| App components and reuse of `ui` | [App components](references/app-components.md) |
| Pages, layouts, loading, errors, metadata, generated props | [Pages and routing](references/pages-and-routing.md) |
| Cache Components, cache invalidation, Server Actions | [Data and caching](references/data-and-caching.md) |
| Server/Client boundary, serialization, streaming | [Server and Client Components](references/server-client.md) |

Other concerns keep their own owners:

| Concern | Owner |
| --- | --- |
| Styles, layout, spacing, selectors, motion | `k2bg-css-guidelines` — `.claude/skills/k2bg-css-guidelines/SKILL.md` |
| Token names and existing library inventory | `k2bg-figma-design` — `.claude/skills/k2bg-figma-design/SKILL.md` |
| Stories and bilingual Storybook documentation | `k2bg-storybook-docs` — `.claude/skills/k2bg-storybook-docs/SKILL.md` |
| Test scope and assertions | `.claude/rules/unit-test-guidelines.md` |
| General TypeScript and function splitting | `.claude/rules/code-style.md` |
| App-specific error translation and fallback | `.claude/rules/error-handling-guidelines.md` |
| Portfolio dictionary flow | `.claude/rules/portfolio-i18n-guidelines.md` |
| Video primitives (outside this skill) | `.claude/rules/remotion-template-guidelines.md` |

## Review Checklist

- Component, hook, or prop names that do not follow [Naming](references/naming.md)
- Re-implementation of a part that exists in `ui`, or domain-independent visualization placed in an app
- Multiple components in one file, or helper components defined in a page/layout
- Derived props, slot types that admit values the component discards, or conflicting sources of state
- Dropped native/Base UI props or refs, `forwardRef`, `asChild`, or caller classes merged before defaults
- Compound parts missing dot notation, `displayName`, or `data-slot` on their rendered elements
- Lost accessible name, incorrect role, nested interactive elements, or broken keyboard/focus behavior
- Render side effects, mutated props or state, or manual memoization
- An unnecessarily broad Client boundary or nonserializable data crossing it
- Handwritten route props, unvalidated query values, or query-dependent layout state
- Request-time reads outside Suspense, request APIs inside cached scopes, or classic segment config in a Cache Components app
- Mutation without authorization, validation, or appropriate tag invalidation
- Failure handling that bypasses the owning app's error policy

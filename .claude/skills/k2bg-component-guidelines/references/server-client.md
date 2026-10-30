# Server and Client Components

## Boundary Placement

Pages and layouts are Server Components by default. Keep data access, secrets, and server-only dependencies on the server. Mark server-only modules with `server-only`; a Node-only warehouse SDK follows the app-specific rules in `AGENTS.md`.

Put `'use client'` at the smallest interactive leaves that need state, effects, event handlers, or browser APIs. The directive marks a module boundary and brings its imports into the client graph; adding it to a page/layout unnecessarily broadens that graph. A Server Component can still render Client Components without becoming one itself.

For example, a server-rendered navigation region composes shared interactive controls and a stateful menu. The menu, popover, and dialog wrappers mark their interactive boundaries explicitly.

## Crossing the Boundary

Server-to-Client props use React-supported serializable values. Do not pass warehouse clients, repository instances, secrets, or ordinary server callbacks. Server Actions are explicit server references; they are not ordinary callbacks. Rendered Server Component content can be passed as `children` to a Client wrapper without importing its server module into the client graph.

Pass a leaf only the dictionary sections it needs from the server; the Portfolio dictionary flow follows `.claude/rules/portfolio-i18n-guidelines.md`. State ownership follows [State and headless behavior](state-and-headless.md); server cache ownership follows [Data and caching](data-and-caching.md).

## Suspense and Streaming

Place a Suspense boundary above the component that awaits slow or request-time work. Pass an unresolved promise down when the child owns its await; awaiting it in the parent blocks that parent before the fallback can render.

For example, a report page places an asynchronous report section under Suspense with a skeleton fallback; the section owns data resolution. Keep the route shell outside the slow section. In Cache Components apps, request-time reads such as `searchParams`, cookies, and headers resolve under Suspense and outside cached scopes.

The bundled sources are `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.

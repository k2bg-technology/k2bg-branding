# Selectors and the Cascade

Tailwind utilities are single-class selectors by construction, so the rules here bite mostly in CSS Modules and global stylesheets. Two apply to utilities too: never use the `!` important modifier (`!mt-0`) to win a fight, and never reach into a child with arbitrary variants (`[&_a]:underline`) where the child could carry its own classes.

## Keep Specificity Low and Flat

The cascade is easiest to manage when every rule has roughly the same, minimal weight: one class level, no combinators.

- **One class level per selector** is the default: `.card`, `.title`. A state variant adds a second class or a data attribute on the same element (`.button.isLoading`, `.button[data-loading="true"]`) — a compound selector, still one level, never a descendant chain.
- **No ID selectors.** IDs are for anchors and ARIA wiring, not styling.
- **No qualified or descendant chains** like `div.card` or `.sidebar .nav li a` — they weld styles to DOM structure and start specificity arms races. If a child needs styling, give it its own class.
- Element selectors are fine only for global typography defaults in a base layer (`body`, `h1`–`h6`, `a`, `code`), as in the `@layer base` block of `packages/ui/src/globals.css`.
- Rendered Markdown is the one sanctioned descendant scope: its elements carry no classes, so `.markdown table` (`apps/blog/app/globals.css`) or a `:global` rule under one module class (`apps/blog/components/markdown/Root.module.css`) styles them. Keep each such rule one element deep under the scope class.

## Winning Overrides Without Force

When a style does not apply, fix the cause, not the symptom:

1. Check the rule actually matches (typo, wrong scope, file not loaded).
2. Reorder source: of two equal-specificity rules the later wins — put overriding rules after base rules.
3. Wrap reused base rules in `:where()` to zero their specificity so any consumer class can override them.
4. Group selector lists with `:is()` for brevity, knowing it takes the specificity of its heaviest argument (use `:where()` when that matters).

- **`!important` is banned as an override tool.** The only tolerated uses are declarations that must always win by design (e.g. a global `prefers-reduced-motion` kill switch) and neutralizing third-party inline styles — each with a comment explaining why.
- Deepening a selector (`.page .card .title`) to win a fight is the same ban in disguise.

## Naming

With CSS Modules (and any per-component stylesheet), the file scope already prevents collisions, so naming stays light:

- Module class keys are lowerCamelCase (`AGENTS.md`, "File & Directory Naming"), so they read as `styles.submitButton`.
- Name by role, not appearance: `.submitButton`, not `.blueButton`; `.errorText`, not `.redSmall`.
- Short names local to the component: inside `Card.module.css`, `.title` — not `.cardTitle`; the module scope already says "card".
- No BEM or prefix systems; scoping makes them redundant ceremony.
- In plain global CSS (reset, base layer), keep the same role-based names and one flat class level.

## CSS Modules Specifics

- **`composes`** shares a base class across modules (`.primary { composes: base; }` or `composes: base from "./Button.module.css"`); use it instead of duplicating declarations or reaching into another module's classes.
- **`:global()`** escapes the module scope. Its only uses are hooks that must be global by nature — third-party classes, classes inside rendered Markdown, `body`/`html` state classes, animation names shared across modules — each with a comment saying why. Never use it to style another component's internals.
- Reset and base typography live in a plain global stylesheet (`packages/ui/src/globals.css`), not in a module behind `:global`.
- Prefer data-attribute state selectors that a headless library sets (`.popup[data-swiping]` in `packages/ui/src/components/Drawer/Drawer.module.css`) over mirroring that state into extra classes.
- Module class names are read from the imported object (`styles.title`), so a class that is referenced nowhere in code is dead and should be deleted.

## Nesting

- Nest only for states, pseudo-elements, and media/container queries of the same block (`&:hover`, `&::after`, an `@media` inside the rule).
- Never nest to mirror DOM structure; two levels is the ceiling. Deep nesting recreates descendant-chain specificity and hides where a rule ends up.

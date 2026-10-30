# React Rules and Memoization

**R1. Components and hooks have no side effects during render.**

Avoid → use: pushing to an outer array or deriving output from `Math.random()` or the current time during render → compute from props and state; place side effects in event handlers or effects.

**R2. Props, state, values passed to hooks, and values passed to JSX are not mutated.**

Avoid → use: `props.items.sort()`, `state.list.push(item)` → `items.toSorted()`, `setList([...list, item])`.

**R3. Hooks are called at the top level of components and hooks; components are rendered as JSX, never called as functions.**

Avoid → use: a conditional `useState()` call or `Menu()` → an unconditional top-level hook call and `<Menu />`.

**R4. `useMemo`, `useCallback`, and `memo` are not used; React Compiler memoizes.** All three web apps enable `reactCompiler`, and their builds compile `packages/ui`.

Avoid → use: `useMemo(() => items.filter(matches), [items])`, `useCallback(handleSelect, [])`, or `memo(Menu)` → direct calculations, ordinary handlers, and `Menu`.

**R5. When a value's identity affects an effect or subscription, its structure provides stable dependencies.** Depend on the original props or state, create the value inside the effect, or move the logic to an event handler.

Avoid → use: an effect depending on an options object recreated during render → create the options inside the effect and depend on the original `roomId` prop.

**R6. Code is correct without memoization; Vitest and the UI Storybook run without React Compiler.**

Avoid → use: correctness that depends on a compiler-stabilized object reference → dependencies on the original props or state and correct effect cleanup.

**R7. `'use no memo'` applies only to a component with a Rules of React violation that cannot be fixed, with a comment naming the violation.**

Avoid → use: `'use no memo'` without an identified violation → fix the violation, or retain the directive with a comment naming the required third-party hook that mutates its arguments.

---
paths: apps/**/*.{ts,tsx}, packages/**/*.{ts,tsx}
---

# Coding Standards

## Basic Mindset and Principles

### Code Purpose and Reader Perspective

- **Code must be easy to understand**.
- The purpose of code is to minimize the time it takes for readers (including your future self) to understand it.
- Code is a "document for human readers" and a **communication tool** between programmers. When writing code, shift your perspective from "will the compiler understand this?" to **"is this readable for humans?"**

### Code Quality and Maintainability

- **Boy Scout Rule**: Strive to continuously improve code so that it's cleaner when you commit it than when you checked it out from the repository.
- **Maintaining Lightweight Code**: Even as the project grows, keep the code as **small and lightweight** as possible.
- **Eliminating Unnecessary Elements (Simplicity)**: Actively remove **"excess complexity"** and unused code (mental baggage), and eradicate code complexity.

### Core Principles

- **KISS (Keep It Simple, Stupid)**: Avoid complex processing and advanced techniques, **always keep code simple**.
- **DRY (Don't Repeat Yourself)**: **Strictly prohibit copy & paste of code**, eliminate duplicate logic and constants through functions, variables, and abstraction.
  - Follow the principle of **"One Fact in One Place" (OFOP)**.
- **YAGNI (You Aren't Going to Need It)**: **Do not implement generality or features ahead of time** based on "you might need it later". Write code only for what's needed "now".

## Naming Conventions

- **Naming is the Most Important Task**: Recognize that naming is the most important and difficult challenge in programming, and consider it carefully.
- **Clarify Intent**: Give functions, variables, and classes names that clearly convey their intent and behavior, functioning as a **user interface for code readers**.
- **Avoid Generic Names**: Avoid **empty names** like `tmp`, `retval`, `foo`, and choose names that represent the entity's value or purpose.
- **Use Unambiguous Names**:
  - When indicating ranges, use `min` or `max`, `first` and `last` when limits are inclusive.
  - Use `begin` and `end` for inclusive/exclusive ranges.
  - For boolean values, clarify meaning using prefixes like `is_`, `has_`, `can_`.
  - **Avoid negative names (e.g., `disable_ssl`)**, use affirmative forms (e.g., `use_ssl`).
- **Match User Expectations**: Don't use names that contradict conventions or expectations readers are familiar with (e.g., `get` should be a lightweight accessor).

## Comment Guidelines

- Keep comments only for rationale, constraints, or facts that a reader cannot infer from the code. Prefer clear names and structure when the code can express the same information.
- Never copy prompt instructions, task narration, implementation steps, or an obvious description of what the next line does into a comment.
- In tests, put observable behavior in the test name and assertions instead of restating it in comments.
- Use TSDoc/JSDoc when it gives consumers a useful contract for shared design-system or public logic. App-local one-off functions do not need exhaustive documentation comments.

## Structure and Modularization

- **Separation of Concerns**: Separate code by concerns (business logic, data access, UI, etc.) that have low correlation, and modularize them.
- **Single Responsibility Principle**: Design modules to have only one reason to change.
- **Divide and Conquer**: Divide "large problems" that are difficult to solve into "several small problems" that can be solved independently.
- **Extract Unrelated Subproblems**: Move a subproblem unrelated to the main purpose (utility processing, data formatting, etc.) into its own function only when that function meets a keep condition under "Inline Needless Functions"; otherwise write it at its call site.
- **Inline Needless Functions**: Write an expression at its call site when a function would only forward to one call or would be a local helper with a single caller. Keep a function only when:
  - it has two or more callers;
  - it is a tested public unit (domain rule, use case, adapter mapper, DI factory);
  - the Control Flow rules require it (an early-return function for a multi-way expression, a child component for JSX branching);
  - it changes behavior at a boundary, such as an `async` wrapper that turns a synchronous throw into a rejected promise, or a `'use client'` or Suspense boundary. Such a function carries a one-line why-comment.
- **Component Placement**: A Next.js page or layout file defines no component other than its default export; route configuration exports such as `dynamic` and `metadata` stay. A component that a page or layout needs lives in `apps/<app>/components/<kebab-case-directory>/<PascalCase>.tsx`. Each component file holds one component.
- **No Derived Props**: A component does not receive a prop that it already derives from another prop.
- **One Thing at a Time**: Design functions and code blocks to perform **one task at a time**.
- **Single Level of Abstraction Principle (SLAP)**: Maintain all processing within a function at the **same level of abstraction**.

## Control Flow and Logic Improvement

- **Early Return**: To reduce nesting, use `return` or `break` to exit functions or loops early whenever possible (guard clauses).
- **Condition Expression Order**: In conditional expressions, place **changing values (investigation target) on the left** and stable values (comparison target) on the right.
- **Affirmative if/else**: In `if/else` blocks, prefer affirmative conditions over negative conditions (e.g., `if (!url.HasQueryParameter)`).
- **Avoid do/while**: Avoid `do/while` loops where the condition is unnaturally at the bottom of the block; rewrite using `while` loops.
- **Ternary Operator Use**: `style/noNestedTernary` rejects nested ternary expressions; a single-level ternary stays allowed, including in JSX.
  - A value mapping uses a lookup object. A multi-way expression uses a small early-return function.
  - In JSX, a branch decided by one condition uses a top-level child component written with early returns (`if (condition) return <A />; return <B />;`); the child never returns a ternary. More complex branching uses an immediately invoked function with an `if` chain, as in `apps/blog/components/markdown/AffiliateEmb.tsx` and `apps/blog/components/markdown/MediaEmb.tsx`.
  - `renderXxx` helpers and components defined inside components stay disallowed.

## Variables and Scope

- **Prefer Single Assignment**: Set variable values only once and **minimize reassignment (value changes)** (recommend immutable design). As the number of places manipulating variables increases, tracking values becomes difficult.
- **No `let`**: The `noLet` Biome plugin (`packages/biome-config/plugins/noLet.grit`) rejects every `let` declaration; write `const`.
  - Restructure function-local reassignment with recursion, `reduce`, `findIndex`, or a function that returns the value. A rewrite of an accumulation keeps the original order of operations.
  - Suppress with `// biome-ignore lint/plugin/noLet: <reason>` only for module-level state that must survive across calls: lazy singletons and dependency caches, test-infrastructure handles, factory sequence counters, mock state read by `vi.mock`. A mutable holder object is not a substitute.
  - Each workspace `biome.jsonc` declares the plugin path itself, because Biome resolves plugin paths against every config that extends the shared one.
- **Minimize Scope**: Move variable definitions to **just before they are used**, keeping variable scope (visible range) as small as possible.
- **Remove Intermediate Results and Control Flow Variables**:
  - Remove variables used only to hold intermediate calculation results (e.g., `index_to_remove`) by using results immediately, simplifying code.
  - Replace control flow variables used only to control loop execution (e.g., `done`) with `break` or `continue` and remove them.
- **Use Explanatory Variables**: Introduce **explanatory variables** or **summary variables** to clarify the meaning of complex expressions or large code chunks.

## Type Annotations

- Exported functions, exported hooks, and public methods of exported classes declare an explicit return type.
- React components are exempt, including PascalCase functions and Next.js pages and layouts.
- A function that returns an object literal uses a named type defined next to it.
- Exported constants rely on inference; `as const` objects, schemas, tables, and variant definitions derive other types from the inferred type.
- Non-exported functions, local variables, and constants carry no annotation when inference yields the same type.
- An annotation stays where it supplies the type, including a literal checked against a contract, an empty collection, a variable without an initializer, a type guard, recursion, an overload, or deliberate widening.

## Formatting and Visual Alignment

- **Consistent Style**: Apply consistent style throughout the project.
- **Visual Handrails**:
  - Adjust line breaks so similar code blocks **look the same (silhouette)**.
  - **Align "columns"** of related code such as variable declarations and argument lists to facilitate skimming.
- **Meaningful Order**: Follow **consistent and meaningful ordering** such as alphabetical or importance-based for related code sequences (e.g., declaration order).
- **Logical Paragraphs**: Divide code into logical "paragraphs" using blank lines to make code flow clearer.

## Testing and Debugging

- **Test Readability**: Write test code as **readably** as production code.
- **Simple Input Values**: Choose **the cleanest and simplest values** that effectively test the code completely.
- **Useful Error Messages**: Design tests to display **helpful error messages that facilitate bug discovery and fixing** when tests fail.
- **Use Assertions**: Be aware of **preconditions** that should be met before a function is called and **results (postconditions)** that should be guaranteed after completion, and use `assert` functions to immediately stop execution on contract violations.
  - It's effective to insert assertions (such as invariant assertions) in code to verify that runtime behavior is as expected.
- **Crash Principle**: When unrecoverable errors or unexpected situations occur, prioritize **immediately stopping execution (crashing)** rather than continuing processing in an uncertain state.

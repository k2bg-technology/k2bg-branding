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

- **Improve the Code Itself**: Don't try to compensate with comments; **fix the code itself to make it self-documenting**. In most cases, improve the code rather than adding comments.
- **Explain Only "Why"**: Record only **information that cannot be read from the code**, such as design decision rationale, trade-offs, and background information.
- **Mark Problem Areas**: Tag places that need improvement with `NOTE:`, `TODO:`, `FIXME:`, `HACK:`, `XXX:`, etc. (use sparingly).
- **Write in English**: When writing comments, write them in English.
- **No Documentation Comments Required**: Do not include TSDoc/JSDoc unless specifically instructed.

## Structure and Modularization

- **Separation of Concerns**: Separate code by concerns (business logic, data access, UI, etc.) that have low correlation, and modularize them.
- **Single Responsibility Principle**: Design modules to have only one reason to change.
- **Divide and Conquer**: Divide "large problems" that are difficult to solve into "several small problems" that can be solved independently.
- **Extract Unrelated Subproblems**: Actively find **unrelated subproblems** (utility processing, data formatting, etc.) from the program's main purpose and extract them as separate general-purpose functions.
- **One Thing at a Time**: Design functions and code blocks to perform **one task at a time**.
- **Single Level of Abstraction Principle (SLAP)**: Maintain all processing within a function at the **same level of abstraction**.

## Control Flow and Logic Improvement

- **Early Return**: To reduce nesting, use `return` or `break` to exit functions or loops early whenever possible (guard clauses).
- **Condition Expression Order**: In conditional expressions, place **changing values (investigation target) on the left** and stable values (comparison target) on the right.
- **Affirmative if/else**: In `if/else` blocks, prefer affirmative conditions over negative conditions (e.g., `if (!url.HasQueryParameter)`).
- **Avoid do/while**: Avoid `do/while` loops where the condition is unnaturally at the bottom of the block; rewrite using `while` loops.
- **Ternary Operator Use**: Use ternary operators only when they **significantly simplify** the code.

## Variables and Scope

- **Prefer Single Assignment**: Set variable values only once and **minimize reassignment (value changes)** (recommend immutable design). As the number of places manipulating variables increases, tracking values becomes difficult.
- **Minimize Scope**: Move variable definitions to **just before they are used**, keeping variable scope (visible range) as small as possible.
- **Remove Intermediate Results and Control Flow Variables**:
  - Remove variables used only to hold intermediate calculation results (e.g., `index_to_remove`) by using results immediately, simplifying code.
  - Replace control flow variables used only to control loop execution (e.g., `done`) with `break` or `continue` and remove them.
- **Use Explanatory Variables**: Introduce **explanatory variables** or **summary variables** to clarify the meaning of complex expressions or large code chunks.

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

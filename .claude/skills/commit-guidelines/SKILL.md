---
name: commit-guidelines
description: |
  Project-specific commit message rules and best practices.
  Uses gitmoji + Type format with issue references.

  Use when:
  (1) Creating a commit message
  (2) Checking commit message conventions
  (3) Reviewing commit history for consistency
---

## Core Principles

- Keep commits small and meaningful
- Format: **gitmoji + Type: #issue Subject**
- Always include `#issue-number` when an issue exists
- Subject: **imperative mood, capitalize first letter, no period**
- Write commit messages in **English**
- No whitespace errors (trailing spaces, etc.)

## Commit Message Format

- Omit optional items when possible
- Do not include issue number in Footer (it belongs in Subject)

```
<gitmoji> <Type>: #<issue> <Subject>

<Body (optional)>

<Footer (optional)>
```

### Example

```
♻️ Refactor: #117 Use DI container for SyncHeroImages use case

- Extracted external image source interfaces
- Added adapter implementations for Notion integration
- Improved testability through dependency injection
```

## Type (Commit Types)

| Type | Gitmoji | Purpose |
|------|---------|---------|
| Feat | ✨ | New feature |
| Fix | 🐛 | Bug fix |
| Refactor | ♻️ | Code refactoring without behavior change |
| Docs | 📝 | Documentation updates |
| Test | ✅ | Test additions or modifications |
| Chore | 🩹 | Minor tasks that don't fit other categories |
| Style | 🎨 | Code formatting, linting fixes |
| Remove | 🔥 | Removing code or files |

## Subject Rules

- Always add `:` after Type
- Place issue number after Type (e.g., `#117`)
- Start with a verb (Add / Update / Refactor / Fix / Remove ...)
- Capitalize the first letter
- No period at the end
- Avoid unnecessary symbols

### Bad

```
♻️ Refactor: Fixing the i18n provider.
```

### Good

```
♻️ Refactor: #40 Refactor i18n provider to eliminate duplicate logic
```

## Body (Optional but Recommended)

- Explain **why** (reason) and **what** (content) of the change
- Write assuming reviewers have no prior context
- Separate sections with blank lines
- Capitalize the first letter of each paragraph

## Guidelines Summary

1. Always specify Type
2. Separate Subject and Body with a blank line
3. No whitespace errors
4. No unnecessary punctuation
5. No period at the end of Subject
6. Capitalize the first letter of each paragraph
7. Use imperative mood in Subject
8. Explain reason and content in Body
9. Clearly describe the problem background
10. Do not assume code is self-explanatory
11. Follow project conventions (this document)

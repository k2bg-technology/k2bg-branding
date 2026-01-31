---
name: branch-guidelines
description: |
  Project-specific branch creation and management guidelines based on GitHub Flow.
  Ensures main branch remains deployable at all times.

  Use when:
  (1) Creating a new feature or fix branch
  (2) Checking branch naming conventions
  (3) Branching from main for new work
---

## Core Principles

- Default branch is **`main`**
- **`main` must always be deployable**
- Direct push to `main` is prohibited; **changes must go through work branches**
- All work branches **derive from `main`**

## Branch Types

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/123-add-login-api` |
| `fix/` | Bug fixes | `fix/456-header-overflow` |
| `release/` | Pre-release adjustments | `release/1.4.0` |
| `hotfix/` | Production emergency fixes | `hotfix/789-fix-payment-error` |

## Naming Convention

### Basic Format

```
<prefix>/<issue-number>-<summary-in-kebab-case>
```

### With Issue (Recommended)

- **Always include the issue number in the branch name**
- Example: `feature/117-refactor-sync-hero-images`

### Without Issue

- Branches without numbers are acceptable
- Example: `feature/add-tooling`
- However, **creating an issue before branching is recommended**

## Branch Creation Steps

```bash
git checkout main
git pull origin main
git checkout -b feature/123-add-login-api
```

## Operational Rules

- **One task (one issue) = one branch** as the default
- Delete branches after work completion and merge
- For long-running branches, regularly merge `main` to keep up-to-date

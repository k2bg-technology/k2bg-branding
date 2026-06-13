# Blog App Specifications

This directory contains lightweight product and domain specifications for `apps/blog`.

The repository follows a code-first documentation model:

- TypeScript types, Zod/OpenAPI schemas, Drizzle schema, migrations, and tests are the source of truth for executable behavior.
- These specs are the source of truth for domain language, business rules, boundaries, and decision context.
- Do not duplicate full implementation details in Markdown. Link to code identifiers and record only the rules and decisions that help future changes.

## Structure

| File                                 | Purpose                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| [`glossary.md`](./glossary.md)       | Canonical domain vocabulary and cross-context naming collisions |
| [`post.md`](./post.md)               | Post lifecycle, publication rules, queries, and sync boundaries |
| [`media.md`](./media.md)             | Media asset rules and retrieval operations                      |
| [`affiliate.md`](./affiliate.md)     | Affiliate link types, provider rules, and retrieval operations  |
| [`contact.md`](./contact.md)         | Contact form submission and confirmation email behavior         |
| [`social-feed.md`](./social-feed.md) | Social media feed retrieval and display rules                   |
| [`decisions/`](./decisions/)         | Architecture decision records                                   |

## Spec Format

Each module spec should stay small and use only the sections that matter:

1. Purpose
2. Problem & Outcome (target user, problem, desired outcome, success signal, non-goals)
3. Scope
4. Terms
5. Rules
6. Use Cases
7. Contracts
8. Test Expectations

Split a module into multiple files only when the single file becomes hard to review, or when a change needs a deeper design record before implementation.

## PRDs and RFCs

This repository does not keep separate `prd/` or `rfc/` directories. Those roles are absorbed by the existing artifacts:

- **PRDs live as issues.** Product and requirements framing is published to the issue tracker, not committed as files. Each module spec's `Problem & Outcome` section captures the requirements that need to persist alongside the domain rules.
- **RFCs live as decision records.** A design proposal that needs review before implementation is written as a `Proposed` decision in [`decisions/`](./decisions/) and updated to `Accepted` once agreed.

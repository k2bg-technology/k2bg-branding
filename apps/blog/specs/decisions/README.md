# Architecture Decisions

This directory stores lightweight architecture decision records.

Use a decision record when the team needs to remember why a meaningful technical or product-design choice was made. Do not create a decision record for routine implementation details that are already obvious from code or tests.

## Naming

Use a four-digit sequence and a short kebab-case title:

```text
0001-use-better-auth.md
0002-keep-user-and-author-separate.md
```

If the sequence reaches `9999`, continue with `10000`. The prefix is for stable ordering, not a hard limit.

## Template

```md
# 0001 Decision title

## Status

Accepted

## Context

What problem or constraint forced this decision?

## Decision

What did we choose?

## Consequences

- What becomes easier?
- What tradeoffs or follow-up work exist?
```

Common statuses: `Proposed`, `Accepted`, `Superseded`, `Rejected`.

Accepted decisions should not be rewritten to hide history. If a later choice replaces one, mark the older record as `Superseded by [NNNN](./NNNN-title.md)` and add a new decision.

## RFCs

Design proposals that need review before implementation (RFCs) are not kept as a separate artifact. Write the proposal as a decision record with `Status: Proposed`, circulate it for review, and update the status to `Accepted` once agreed (or `Rejected` if dropped).

# 0002 Keep User and Author separate

## Status

Accepted

## Context

Two concepts use overlapping language across modules:

- `User` is an authenticatable account owned by better-auth (see [0001](./0001-use-better-auth.md)).
- `Author` is post byline / content metadata in the Post module.

They look related — both represent "a person" — so there is pressure to merge them into one model
or share an id. Merging would couple the public content domain to the authentication domain and leak
auth concerns (sessions, credentials) into post rendering.

## Decision

Keep `User` and `Author` as separate concepts in separate modules. Do not merge them, and do not share
or cross-reference their ids. `Author` lives in the Post domain as content metadata; `User` lives in the
Auth domain as an authenticatable account.

## Consequences

- The Post domain stays independent of the Auth domain; public read paths carry no auth coupling.
- The glossary records this collision permanently (`User` / `Author` row) so the distinction is traceable.
- If a future feature needs to link an author to an account, it must be an explicit, additional mapping —
  not an implicit identity reuse — and should be recorded as a new decision.

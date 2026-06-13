# Post Spec

## Purpose

The Post module manages blog articles and static pages from drafting through publication, archival, soft deletion, public querying, search, and external synchronization.

## Problem & Outcome

- **User:** Search-driven general readers; secondarily the operator who publishes.
- **Problem:** Readers arrive from search and SNS and must quickly find relevant articles and judge k2bg's credibility. The operator needs published content to flow from the external content source to the public site reliably.
- **Desired outcome:** Discoverable, well-ordered, searchable articles that build trust in k2bg, kept in sync from the external content source.
- **Success signal:** Organic search reach and on-site navigation (category / search) usage; no stale or missing published posts after a sync.
- **Non-goals:** In-app authoring/editing (the external content source owns it). The lifecycle transition operations are modeled but not yet invoked by any workflow — see the note under State Transitions.

## Scope

In scope:

- Article and static page metadata.
- Publication status and lifecycle rules.
- Public read/query use cases.
- Synchronization from the external content source.
- Hero image synchronization.

Out of scope:

- Authentication for editing posts.
- Rich text rendering implementation.
- External content provider schema details beyond mapping rules.

## Terms

| Term        | Definition                                    | Code identifier             |
| ----------- | --------------------------------------------- | --------------------------- |
| Post        | A blog article or static page; aggregate root | `Post`                      |
| Article     | Feed-visible content type                     | `PostType.ARTICLE`          |
| Page        | Static content outside the article feed       | `PostType.PAGE`             |
| Post Status | Publication lifecycle state                   | `PostStatus`                |
| Author      | Byline / content metadata, not an auth user   | `AuthorId` / `Author` table |
| Slug        | URL-friendly post identifier                  | `Slug`                      |

## Rules

- A post has exactly one status: `IDEA`, `DRAFT`, `PREVIEW`, `PUBLISHED`, or `ARCHIVED`.
- A post cannot be published when its release date is in the future.
- A published post cannot be published again.
- An archived post cannot be published again.
- Archived posts are read-only for content, image, slug, category, tags, dates, and status updates.
- Revision date must be on or after release date.
- Soft deletion marks `deletedAt`; it does not remove the row.
- Restore clears `deletedAt`.
- Soft delete and restore are allowed even on archived posts. This is an explicit exception to the
  archived read-only rule: deletion and restore are retention operations, not content modifications.

### State Transitions

| From                          | Operation                    | Guard                             | To          | Error                            |
| ----------------------------- | ---------------------------- | --------------------------------- | ----------- | -------------------------------- |
| `IDEA` / `DRAFT` / `PREVIEW`  | `publish()`                  | `releaseDate` is today or earlier | `PUBLISHED` | `FutureReleaseDateError`         |
| `PUBLISHED`                   | `publish()`                  | Never allowed                     | unchanged   | `PostAlreadyPublishedError`      |
| `ARCHIVED`                    | `publish()`                  | Never allowed                     | unchanged   | `CannotPublishArchivedPostError` |
| Any non-archived status       | `archive()`                  | Not already archived              | `ARCHIVED`  | `PostAlreadyArchivedError`       |
| `ARCHIVED`                    | content/date/status updates  | Never allowed                     | unchanged   | `CannotModifyArchivedPostError`  |
| Any status (incl. `ARCHIVED`) | `softDelete()` / `restore()` | —                                 | unchanged   | —                                |

> **Aspirational — not yet invoked.** These transition operations (`publish`, `archive`, `softDelete`,
> `restore`) and their guards are modeled on `Post` but no application workflow calls them today. Post
> status is set by mapping from the external content source during sync; there is no command use case and
> no editing UI. The transitions become active when the settings console (see [`auth.md`](./auth.md))
> gains post-management UI. Until then, treat this table as the intended rule set, not active behavior.

### Aggregate

`Post` is the aggregate root and the only entry point. `Author` is a separate aggregate referenced by
id (`AuthorId`); the post never holds an `Author` object. See
[`decisions/0002`](./decisions/0002-keep-user-and-author-separate.md).

## Use Cases

### UC1 - Fetch a post

Given a public visitor requests a post by id  
When the post exists and is visible for the route  
Then the post with author details is returned.

The URL route contains both id and slug, but `FetchPost` currently accepts and validates only the post id.
The slug is path/canonical metadata and is not validated by this use case yet.

Given the requested post does not exist  
When the post is fetched  
Then `PostNotFoundError` is returned by the use case boundary.

### UC2 - Fetch post summaries

Given public visitors open a listing page  
When summaries are fetched with pagination  
Then article summaries are returned sorted by `releaseDate` in the requested direction (`asc` / `desc`), with `uuid` as a stable tiebreaker.

Given an invalid page or page size is supplied  
When summaries are fetched  
Then `InvalidPaginationError` is returned.

### UC3 - Fetch post summaries by category

Given public visitors open a category listing page  
When summaries are fetched for a category with pagination  
Then matching article summaries are returned sorted by `releaseDate` in the requested direction.

Given an invalid page or page size is supplied  
When summaries are fetched by category  
Then `InvalidPaginationError` is returned.

### UC4 - Search post summaries

Given public visitors submit a search query  
When matching published article summaries exist  
Then matching summaries are returned.

Given the search query is empty or invalid  
When the search runs  
Then `InvalidSearchQueryError` is returned.

### UC5 - Fetch all slugs

Given a caller needs every post slug (for example, static path generation)  
When all slugs are fetched  
Then each post id and slug is returned, sorted by `releaseDate` in the requested direction (default `desc`).

### UC6 - Synchronize posts from external source

Given the external source contains post data  
When synchronization runs  
Then mapped posts are persisted through the batch repository.

Given the external source or persistence fails  
When synchronization runs  
Then `SyncError` or the underlying adapter error is surfaced.

### UC7 - Synchronize hero images

Given posts contain hero image URLs  
When hero image synchronization runs  
Then images are uploaded through the image repository and post image URLs are updated.

Given image upload or persistence fails  
When hero image synchronization runs  
Then `SyncError` or the underlying adapter error is surfaced.

## Contracts

| Operation                      | Boundary              | Request                        | Response / Result     | Errors                      |
| ------------------------------ | --------------------- | ------------------------------ | --------------------- | --------------------------- |
| `FetchPost`                    | use case / route      | post id                        | post DTO with author  | `PostNotFoundError`         |
| `FetchPostSummaries`           | use case              | pagination params              | paginated summary DTO | `InvalidPaginationError`    |
| `FetchPostSummariesByCategory` | use case              | category and pagination params | paginated summary DTO | `InvalidPaginationError`    |
| `SearchPostSummaries`          | use case              | query and pagination params    | paginated summary DTO | `InvalidSearchQueryError`   |
| `FetchAllSlugs`                | use case              | optional order direction       | post id and slug list | adapter errors              |
| `SyncPostsFromExternal`        | use case / Hono route | no body                        | sync result           | `SyncError`, adapter errors |
| `SyncHeroImages`               | use case / Hono route | no body                        | sync result           | `SyncError`, adapter errors |

Permission:

- Public read operations are unauthenticated.
- Sync routes are protected by the Hono API key middleware.

## Test Expectations

- Domain-unit tests cover value object validation, publication guards, archived read-only behavior, date consistency, soft delete, and restore.
- Acceptance tests cover fetch, list, category list, search, and sync happy/error paths.
- Integration tests cover Drizzle repository mapping, query services, pagination, sorting, search filtering, and `MappingError` on invalid persistence data.
- Route tests cover API key protection and response schema behavior for sync endpoints.

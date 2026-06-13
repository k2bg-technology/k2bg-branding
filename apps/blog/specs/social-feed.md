# Social Feed Spec

## Purpose

The Social Feed module fetches social media posts from an external provider and exposes a provider-neutral feed for the blog UI.

## Problem & Outcome

- **User:** General readers judging whether k2bg is actively present.
- **Problem:** A reader wants signs that k2bg is alive and active; a live feed acts as social proof that reinforces trust.
- **Desired outcome:** A current, provider-neutral feed embedded on the blog that conveys activity.
- **Success signal:** The feed renders recent posts and contributes to perceived liveliness and trust (qualitative).
- **Non-goals:** Driving readers to Instagram or growing the social channel is **not** the goal — the feed serves on-blog social proof. Persistence, moderation, scheduling, and analytics are also out of scope.

## Scope

In scope:

- Social post identity, media URL, permalink, media type, caption, timestamp, and optional thumbnail URL.
- Provider-neutral display URL selection.
- Fetching a limited set of user media.

Out of scope:

- Persisting social posts.
- Multi-provider orchestration beyond the `SocialFeedFetcher` port.
- Moderation, scheduling, or analytics.

## Terms

| Term                | Definition                         | Code identifier           |
| ------------------- | ---------------------------------- | ------------------------- |
| Social Post         | Provider-neutral social media post | `SocialPost`              |
| Post Id             | External provider id, not a UUID   | `PostId` in `social-feed` |
| Media Url           | URL of the post media content      | `MediaUrl`                |
| Permalink           | Permanent provider link            | `Permalink`               |
| Media Type          | Social media content type          | `MediaType`               |
| Social Feed Fetcher | Output port for provider fetches   | `SocialFeedFetcher`       |

## Rules

- A social post requires id, media URL, permalink, media type, and timestamp.
- `MediaType` supports `IMAGE`, `VIDEO`, and `CAROUSEL_ALBUM`.
- For videos, `getDisplayUrl()` returns the thumbnail URL when present.
- For images and carousel albums, `getDisplayUrl()` returns the media URL.
- Social Feed `PostId` is an external provider string and must not be confused with blog Post `PostId`.
- Default feed limit is 6 when no limit is provided.

## Use Cases

### UC1 - Fetch feed

Given the blog UI requests a social feed  
When no limit is provided  
Then up to the default number of posts is fetched from the provider.

Given the blog UI requests a social feed with a limit  
When the provider returns posts  
Then the use case returns social post DTOs with `displayUrl`.

Given the provider fails or returns invalid data  
When the feed is fetched  
Then the adapter or mapping error is surfaced.

## Contracts

| Operation   | Boundary | Request          | Response / Result    | Errors                    |
| ----------- | -------- | ---------------- | -------------------- | ------------------------- |
| `FetchFeed` | use case | optional `limit` | `SocialPostOutput[]` | provider / mapping errors |

Permission:

- Social feed reads are public.

## Test Expectations

- Domain-unit tests cover required social post fields, media type validation, display URL selection, and equality by id.
- Acceptance tests cover default limit, explicit limit, and output DTO shape.
- Adapter tests cover Instagram provider mapping and provider failure behavior.

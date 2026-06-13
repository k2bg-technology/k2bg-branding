# Media Spec

## Purpose

The Media module manages image and video assets used by blog content, embedded media, and promotional surfaces.

## Problem & Outcome

- **User:** Readers (who see fast, optimized images) and the operator (who needs a reliable image pipeline) — indirectly. Media is a supporting capability, not a destination feature.
- **Problem:** Blog content, embedded media, and promotional surfaces need images served fast and consistently regardless of whether the source is an uploaded file or an external URL.
- **Desired outcome:** Each media item resolves to one effective source (file over URL) for downstream CDN processing.
- **Success signal:** Images render through the CDN without missing or broken sources.
- **Non-goals:** Media is not a standalone user problem; it supports Post and Affiliate. Image transformation, CDN upload behavior, and post-body rendering are out of scope (see Scope).

## Scope

In scope:

- Media identity, display name, type, source, target URL, dimensions, and image extension.
- Source priority between uploaded file and external URL.
- Fetching one media item.
- Fetching image sources for downstream processing.

Out of scope:

- Image transformation and CDN upload behavior.
- Post body rendering rules.
- External provider schema details beyond mapping into `Media`.

## Terms

| Term        | Definition                                   | Code identifier                      |
| ----------- | -------------------------------------------- | ------------------------------------ |
| Media       | Image or video asset used by the blog        | `Media`                              |
| Media Type  | Asset kind                                   | `MediaType.IMAGE`, `MediaType.VIDEO` |
| Source File | Uploaded local file path                     | `SourceFile`                         |
| Source Url  | External media URL                           | `SourceUrl`                          |
| Target Url  | Destination when the media is clicked        | `TargetUrl`                          |
| Extension   | Image file extension derived from the source | `Extension`                          |

## Rules

- A media item must have at least one source: `sourceFile` or `sourceUrl`.
- If both `sourceFile` and `sourceUrl` exist, `sourceFile` is the effective source.
- `Extension` is meaningful for images only.
- `Width` and `Height` are pixel dimensions when available from the source.

## Use Cases

### UC1 - Fetch media

Given a caller has a media identifier  
When the media exists  
Then the media DTO is returned.

Given the media identifier does not match an item  
When the media is fetched  
Then `MediaNotFoundError` is returned.

Given the media identifier is malformed  
When the media is fetched  
Then `InvalidMediaIdError` is returned.

### UC2 - Fetch all image sources

Given the external media source contains image media  
When all image sources are fetched  
Then each returned item contains the media id and effective image source URL.

Given the external source fails or returns invalid data  
When all image sources are fetched  
Then the adapter or mapping error is surfaced.

## Contracts

| Operation              | Boundary                 | Request  | Response / Result     | Errors                                      |
| ---------------------- | ------------------------ | -------- | --------------------- | ------------------------------------------- |
| `FetchMedia`           | use case                 | media id | media DTO             | `MediaNotFoundError`, `InvalidMediaIdError` |
| `FetchAllImageSources` | use case / query service | none     | `ImageSourceOutput[]` | adapter errors                              |

Permission:

- Media read operations are public unless exposed through a protected operational route.

## Test Expectations

- Domain-unit tests cover source requirement, file-over-URL priority, value object validation, and equality by id.
- Acceptance tests cover fetch media success/not found and image source collection.
- Adapter tests cover external source mapping and `MappingError` for missing or unknown media data.

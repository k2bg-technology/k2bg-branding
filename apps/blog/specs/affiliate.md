# Affiliate Spec

## Purpose

The Affiliate module manages affiliate links embedded in blog posts: product cards, banner ads, text links, and sub-provider links for multi-provider product promotion.

## Problem & Outcome

- **User:** Readers seeking concrete product recommendations; the operator monetizing the blog.
- **Problem:** Readers want recommendations made concrete and actionable; the operator wants those recommendations to generate affiliate revenue. Both matter equally.
- **Desired outcome:** Useful, well-rendered affiliate placements that serve readers and earn revenue.
- **Success signal:** Reader value is judged qualitatively (placements read as helpful, not spammy). Revenue is measured in the affiliate providers' (ASP) own dashboards — Amazon Associates, A8, and similar — not in this application.
- **Non-goals:** In-app click tracking and revenue attribution are intentionally out of scope; measurement is delegated to the ASP dashboards. Provider API integration and rendering layout details are also out of scope.

## Scope

In scope:

- Affiliate type modeling.
- Provider, target URL, image, and provider color fields.
- Product-to-sub-provider references by id.
- Fetching affiliates by id or by ids.
- Fetching image sources for downstream processing.

Out of scope:

- Click tracking and revenue attribution.
- Provider API integration.
- Rendering layout details for affiliate components.

## Terms

| Term           | Definition                                                 | Code identifier        |
| -------------- | ---------------------------------------------------------- | ---------------------- |
| Affiliate      | Union of concrete affiliate entities                       | `Affiliate`            |
| Banner         | Image-based advertisement                                  | `AffiliateBanner`      |
| Product        | Product promotion with image and optional sub-provider ids | `AffiliateProduct`     |
| Text           | Text-only affiliate link                                   | `AffiliateText`        |
| Sub Provider   | Auxiliary provider link for a product                      | `AffiliateSubProvider` |
| Provider Color | Display color associated with a provider                   | `ProviderColor`        |

## Rules

- Every affiliate has an id, name, target URL, provider, and type.
- `Banner` requires image source URL, image width, and image height.
- `Product` requires provider color, image provider, image source URL, image width, and image height.
- `Product` may reference sub providers by id.
- `SubProvider` requires provider color.
- `Text` does not require image fields.
- Provider values are dynamic strings, not a fixed enum.
- `Product` sub-providers are optional. They are referenced by id through `SubProviderIds`, which may be empty (`hasSubProviders()` reports presence).
- Affiliate images use `ImageSourceUrl` only. The affiliate domain has no file-upload concept and no source-file priority.

## Aggregate

Each concrete affiliate (`AffiliateBanner`, `AffiliateProduct`, `AffiliateText`, `AffiliateSubProvider`) is its own entity identified by `AffiliateId`. `AffiliateProduct` references its sub-providers by id (`SubProviderIds`), never by holding the sub-provider entities.

## Use Cases

### UC1 - Fetch affiliate

Given a caller has an affiliate id  
When the affiliate exists  
Then the concrete affiliate DTO is returned.

Given the affiliate id does not match an item  
When the affiliate is fetched  
Then `AffiliateNotFoundError` is returned.

Given the affiliate id is malformed  
When the affiliate is fetched  
Then `InvalidAffiliateIdError` is returned.

### UC2 - Fetch affiliates by ids

Given a post body references multiple affiliate ids  
When affiliates are fetched in batch  
Then a list of concrete affiliate DTOs (each carrying its type-specific fields: provider, target URL, and any image/provider-color data) is returned.

Given one or more ids are malformed  
When affiliates are fetched in batch  
Then `InvalidAffiliateIdError` is returned.

### UC3 - Fetch all image sources

Given affiliates include banner and product images  
When all image sources are fetched  
Then only image-bearing affiliates produce image source outputs.

## Contracts

| Operation              | Boundary                 | Request       | Response / Result     | Errors                                              |
| ---------------------- | ------------------------ | ------------- | --------------------- | --------------------------------------------------- |
| `FetchAffiliate`       | use case                 | affiliate id  | affiliate DTO         | `AffiliateNotFoundError`, `InvalidAffiliateIdError` |
| `FetchAffiliatesByIds` | use case                 | affiliate ids | affiliate DTO list    | invalid id errors                                   |
| `FetchAllImageSources` | use case / query service | none          | `ImageSourceOutput[]` | adapter errors                                      |

Permission:

- Affiliate read operations are public when used for rendering published content.

## Test Expectations

- Domain-unit tests cover concrete entity requirements, value object validation, and equality by id.
- Acceptance tests cover single fetch, batch fetch, not-found behavior, and image source collection.
- Adapter tests cover external-source type detection, affiliate mapping, and `MappingError` for unknown or incomplete external data.

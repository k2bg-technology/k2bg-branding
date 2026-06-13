# Blog App Glossary

This document is the canonical glossary for `apps/blog` domain vocabulary.

The glossary does not replace code. It fixes the meaning of business terms so the same concept can be traced across domain code, API contracts, database schema, UI labels, and tests.

## Conventions

- Use full, descriptive identifiers.
- Prefer the domain word over a technical synonym.
- When the same word means different things in different modules, qualify it by context.
- Code identifiers listed here point to the current implementation. If code and spec disagree, record the discrepancy and decide which side should change.

## Shared Terms

| Term                    | Definition                                                              | Code identifier                    |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| Identifier              | UUID-based entity identifier unless explicitly documented otherwise     | `PostId`, `MediaId`, `AffiliateId` |
| Image Source            | Pair of an entity id and image URL used for image sync / CDN processing | `ImageSource`                      |
| Fetch All Image Sources | Collect image sources for downstream processing                         | `FetchAllImageSources`             |

## Module Terms

The operation list for each module is owned by that module spec's Contracts section, not duplicated here. This table fixes only the core entity per module.

| Module      | Core entity                            |
| ----------- | -------------------------------------- |
| Post        | `Post`                                 |
| Media       | `Media`                                |
| Affiliate   | `Affiliate` union                      |
| Auth        | `User`, `Session` owned by better-auth |
| Contact     | `Contact`                              |
| Social Feed | `SocialPost`                           |

## Cross-Context Collisions

| Name              | Contexts            | Resolution                                                                                                                                                                     |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `User` / `Author` | Auth / Post         | `User` is an authenticatable account. `Author` is post metadata and must not be merged with `User`. See [`decisions/0002`](./decisions/0002-keep-user-and-author-separate.md). |
| `PostId`          | Post / Social Feed  | Post `PostId` is UUID-based. Social Feed `PostId` wraps an external provider string.                                                                                           |
| `MediaType`       | Media / Social Feed | Media supports `IMAGE` and `VIDEO`. Social Feed also supports `CAROUSEL_ALBUM`. Keep the enums separate.                                                                       |
| `Name`            | Affiliate / Contact | Affiliate `Name` is display text for an affiliate item. Contact `Name` is the submitter's name.                                                                                |
| `TargetUrl`       | Media / Affiliate   | Media `TargetUrl` is a click-through destination for media. Affiliate `TargetUrl` is the affiliate destination.                                                                |

## Known Naming Discrepancy

| Concept            | Current code          | Spec / UI wording            | Decision                                                                                    |
| ------------------ | --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Lifestyle category | `Category.LIFE_STYLE` | "Lifestyle" / ライフスタイル | Keep the code identifier for compatibility unless a separate migration decision changes it. |

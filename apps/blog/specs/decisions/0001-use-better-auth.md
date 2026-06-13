# 0001 Use better-auth for blog admin authentication

## Status

Accepted

## Context

The blog needs authentication for the settings screen. The application should not own password hashing, credential storage, or session lifecycle mechanics unless there is a strong reason to do so.

The v1 product model is a single administrator, but the implementation should keep a path toward multiple users and role-based authorization.

## Decision

Use better-auth with email/password authentication for the blog settings screen.

better-auth owns:

- credential storage,
- password hashing,
- session issue/read/revoke behavior,
- `User`, `Session`, `Account`, and `Verification` tables.

The application owns:

- protected route policy,
- unauthenticated redirect behavior,
- the `admin` role concept,
- first administrator provisioning.

## Consequences

- Authentication mechanics are delegated to a dedicated provider.
- `/api/auth/*` is separate from the existing Hono `/api/*` routes.
- The application must keep route protection explicit at both middleware and server-rendered settings boundaries.
- Public sign-up, password reset, password change, and email verification remain out of scope for v1.

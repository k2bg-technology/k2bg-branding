# Auth Spec

> **Status: Planned (design doc).** Unlike the other module specs, which describe shipped behavior
> (as-built), this document specifies a feature that is not yet implemented (as-designed). No auth
> code, middleware, or `/api/auth` route exists yet. See [`decisions/0001`](./decisions/0001-use-better-auth.md).

## Purpose

The Auth module protects the blog settings screen. Authentication mechanics are delegated to better-auth; the application owns access policy, route protection, the `admin` role concept, and first administrator provisioning.

## Problem & Outcome

- **User:** The single operator (admin).
- **Problem:** The operator needs to run blog operations that the external content source does not cover — manual sync triggers and their status, affiliate / media management, and site / publication settings — through a UI, without touching code or API keys. That UI must be reachable only by the operator.
- **Desired outcome:** A protected settings console that only the authenticated operator can reach.
- **Success signal:** The operator can log in and reach `/settings`; unauthenticated visitors are redirected to `/login`; public read paths carry no added auth cost (existing Hono `x-api-key` routes unchanged).
- **Non-goals:** Public sign-up, password reset / change, email verification, and per-role enforcement beyond the v1 `admin` concept (see Scope).
- **First protected slice (recommended):** Auth should ship alongside at least one real settings feature so it does not guard an empty shell. Recommended first surface: a **manual sync trigger UI** over the existing API-key sync routes (`SyncPostsFromExternal`, `SyncHeroImages`). The broader console (affiliate / media management, site settings) follows as separate work.

## Scope

In scope:

- Log in with email and password.
- Log out.
- Retrieve current session.
- Protect `/settings/:path*`.
- Redirect unauthenticated visitors to `/login`.
- Provision the first administrator outside public sign-up.

Out of scope:

- Public sign-up.
- Password reset.
- Password change.
- Email verification.
- Per-role authorization enforcement beyond the v1 `admin` concept.

## Terms

| Term          | Definition                                                                  | Code identifier                   |
| ------------- | --------------------------------------------------------------------------- | --------------------------------- |
| User          | Authenticatable account owned by better-auth; not the same as post `Author` | `User` better-auth schema         |
| Session       | Logged-in session for exactly one user                                      | `Session` better-auth schema      |
| Account       | Credential record linked to a user                                          | `Account` better-auth schema      |
| Verification  | Token records owned by better-auth; unused flows in v1                      | `Verification` better-auth schema |
| Role          | Authorization level; only `admin` in v1                                     | application-owned concept         |
| Access Policy | Settings pages require a valid session                                      | route protection                  |

## Rules

- The settings screen requires a valid session.
- Visitors without a valid session are redirected to `/login`.
- Authenticated administrators can access settings pages.
- The v1 user model is single administrator, but the `Role` concept is kept for future expansion.
- There is no public sign-up.
- First administrator provisioning is an operator action.
- Credentials, password hashing, and session lifecycle are owned by better-auth.
- better-auth uses its Drizzle adapter for auth persistence.

## Technical Design

### Routing

better-auth is mounted on a dedicated Next.js route handler:

```text
app/api/auth/[...all]/route.ts
```

This is separate from the existing Hono catch-all route:

```text
app/api/[[...route]]/route.ts
```

Next.js route precedence sends `/api/auth/*` to better-auth and leaves all other `/api/*` paths to Hono.

Existing Hono API-key routes such as `/api/posts`, `/api/images`, and `/api/revalidate` are unaffected.

### Route Protection

Two protection layers are required:

| Layer               | Location                                       | Responsibility                                                       |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Optimistic redirect | `middleware.ts` matcher for `/settings/:path*` | Cheaply redirect to `/login` when the session cookie is absent       |
| Authoritative gate  | `app/settings/layout.tsx` server component     | Call `getSession`; redirect to `/login` when no valid session exists |

The middleware is an optimization. The server-side layout check is the security boundary.

### Persistence

better-auth owns the auth tables through its Drizzle adapter.

| Table          | Purpose                                 |
| -------------- | --------------------------------------- |
| `User`         | Authenticatable accounts                |
| `Session`      | Active sessions                         |
| `Account`      | Credentials per user                    |
| `Verification` | Verification tokens for unused v1 flows |

Implementation notes:

- Auth tables are generated into `infrastructure/drizzle/schema.ts`.
- `drizzle.config.ts` includes the auth tables in `tablesFilter`.
- Table names use PascalCase to match existing `Author` and `Post` tables.

### Provisioning

The first administrator is created by a one-off seed script that calls better-auth's `signUp` API with initial credentials from environment variables. This keeps password hashing provider-owned.

### Mapping

- DB to Auth and Auth to DB conversions are owned by better-auth's Drizzle adapter.
- The application should not add hand-written auth persistence mappers.
- Session to UI display data is the only application-level mapping for v1.

## Use Cases

### UC1 - Log in

Given a visitor submits a registered email and correct password  
When the login form is submitted  
Then a session is created and the visitor is taken to the settings screen.

### UC2 - Reject invalid login

Given a visitor submits an unknown email or incorrect password  
When the login form is submitted  
Then an error message is shown and no session is created.

### UC3 - Log out

Given an authenticated administrator  
When they log out  
Then the session is destroyed and they are returned to the login screen.

### UC4 - Protect settings

Given a visitor has no valid session  
When they open a settings page  
Then they are redirected to the login screen.

Given an authenticated administrator  
When they open a settings page  
Then access is allowed.

Given a visitor holds an expired or forged session cookie  
When they open a settings page  
Then the optimistic middleware lets the request through (cookie is present), but the server-side layout's `getSession` finds no valid session and redirects to `/login`.

This case is the reason the authoritative check lives in the server component, not the middleware: the middleware only inspects cookie presence, so the layout is the security boundary.

### UC5 - Retrieve current session

Given an authenticated administrator is on a settings page  
When the page renders  
Then the logged-in user's display information is available.

## Contracts

| Operation   | Boundary                       | Request            | Response / Result                  | Errors                  |
| ----------- | ------------------------------ | ------------------ | ---------------------------------- | ----------------------- |
| Log in      | `POST /api/auth/sign-in/email` | email and password | session cookie / redirect behavior | invalid credentials     |
| Log out     | `POST /api/auth/sign-out`      | current session    | session revoked                    | unauthenticated request |
| Get session | `GET /api/auth/get-session`    | session cookie     | user/session data or null          | provider errors         |

Compatibility:

- better-auth is mounted under `/api/auth/*`.
- Existing Hono `/api/*` routes remain separate.
- Published Hono API docs and `x-api-key` protected routes are unchanged.

## Test Expectations

- Acceptance tests cover login success, login failure, logout, protected-route redirect, and session display.
- Integration tests exercise route protection and better-auth handler behavior.
- Security checks verify credentials are not logged and settings pages use a server-side authoritative session check.

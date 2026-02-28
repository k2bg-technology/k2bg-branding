# Security Policy

## Supported Versions

This is a monorepo containing two Next.js applications. Security updates are applied to the latest version on the `main` branch.

| Application | Supported |
| ----------- | --------- |
| Blog app    | Yes       |
| Portfolio app | Yes     |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them through [GitHub Security Advisories](https://github.com/k2bg-technology/k2bg-branding/security/advisories/new).

When reporting, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

You should receive an initial response within 72 hours. We will keep you informed of the progress toward a fix and may ask for additional information.

## Security Best Practices for Contributors

### Environment Variables

- Never commit secrets, API keys, or credentials to the repository
- Use `.env.local` for local development (this file is gitignored)
- Refer to `.env.example` files in each app directory for required variables

### Dependencies

- Keep dependencies up to date
- Review `pnpm audit` output before merging dependency updates
- Do not add dependencies with known critical vulnerabilities

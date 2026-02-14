# Security Headers Configuration

This document describes the security headers configuration implemented across the K2BG Branding monorepo.

## Overview

Security headers have been configured for both the Blog and Portfolio applications using a shared `security-headers` package. These headers protect against common web vulnerabilities while allowing necessary external resources.

## Implemented Headers

### Content Security Policy (CSP)

**Status:** Report-Only Mode (recommended for initial deployment)

The CSP is currently set to report-only mode to allow monitoring without breaking functionality. Once validated in production, it can be switched to enforcement mode.

#### Blog App CSP

The blog app has a more permissive CSP to accommodate:
- Google Tag Manager (GTM)
- Google Analytics
- Google AdSense
- Cloudinary (image CDN)
- Instagram CDN
- Unsplash images
- AWS S3

Key directives:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com ...
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob: https://res.cloudinary.com ...
font-src 'self' https://fonts.gstatic.com
connect-src 'self' https://www.google-analytics.com ...
frame-src https://www.googletagmanager.com ...
object-src 'none'
```

#### Portfolio App CSP

The portfolio app has a more restrictive CSP with minimal external resources:
```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob:
font-src 'self' https://fonts.gstatic.com
connect-src 'self'
object-src 'none'
```

### X-Frame-Options

**Value:** `DENY`

Prevents the site from being embedded in iframes, protecting against clickjacking attacks.

### X-Content-Type-Options

**Value:** `nosniff`

Prevents browsers from MIME-sniffing responses, reducing the risk of XSS attacks.

### Referrer-Policy

**Value:** `strict-origin-when-cross-origin`

Controls referrer information sent with requests:
- Same-origin: sends full URL
- Cross-origin HTTPS→HTTPS: sends origin only
- HTTPS→HTTP: sends nothing

### Permissions-Policy

**Value:** `camera=(), microphone=(), geolocation=()`

Restricts access to sensitive browser features. No pages are allowed to use camera, microphone, or geolocation.

### Strict-Transport-Security (HSTS)

**Value:** `max-age=63072000; includeSubDomains; preload`

Enforces HTTPS for 2 years, including all subdomains. The site is eligible for HSTS preload list inclusion.

## Rollout Strategy

### Phase 1: Report-Only Mode (Current)

✅ **Status:** Implemented

Both apps are currently using `Content-Security-Policy-Report-Only` header. This allows:
- Monitoring of CSP violations without blocking resources
- Validation that all legitimate resources are allowlisted
- Zero user impact during testing

### Phase 2: Validation

📋 **To Do:**
1. Monitor browser console for CSP violation reports
2. Test all pages and features
3. Verify GTM, AdSense, and other integrations work correctly
4. Adjust CSP directives if needed

### Phase 3: Enforcement

⏳ **Future:**
1. Change `reportOnly` parameter to `false` in next.config files
2. Deploy to production
3. Monitor for any issues
4. Keep adjusting as needed

## Configuration Files

### Shared Package

**Location:** `packages/security-headers/`

The shared package provides three functions:
- `createSecurityHeaders(config)` - General-purpose headers factory
- `createBlogSecurityHeaders(reportOnly)` - Blog-specific preset
- `createPortfolioSecurityHeaders(reportOnly)` - Portfolio-specific preset

### Blog App

**Location:** `apps/blog/next.config.mjs`

```javascript
import { createBlogSecurityHeaders } from 'security-headers';

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createBlogSecurityHeaders(true), // true = report-only
      },
    ];
  },
  // ... other config
};
```

### Portfolio App

**Location:** `apps/portfolio/next.config.js`

```javascript
const { createPortfolioSecurityHeaders } = require('security-headers');

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createPortfolioSecurityHeaders(true), // true = report-only
      },
    ];
  },
  // ... other config
};
```

## Adding New External Resources

If you need to add a new external resource (CDN, analytics, etc.):

1. Add the domain to the appropriate CSP directive in `packages/security-headers/src/index.ts`
2. Update both preset functions if needed
3. Test in report-only mode
4. Deploy and monitor

Example:
```typescript
// To add a new image CDN
imgSrc: [
  'self',
  'data:',
  'blob:',
  'https://new-cdn.example.com', // Add here
  // ... existing domains
],
```

## Testing Headers

### Verify Configuration

```bash
# Blog app
cd apps/blog
node -e "import('./next.config.mjs').then(async c => console.log(await c.default.headers()))"

# Portfolio app
cd apps/portfolio
node -e "const c = require('./next.config.js'); c.headers().then(console.log)"
```

### Check Headers in Browser

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Click on the first request
5. Check Response Headers

### Monitor CSP Violations

In browser console, look for messages like:
```
Refused to load the script 'https://example.com/script.js' because it violates
the following Content Security Policy directive: "script-src 'self'".
```

## Security Considerations

### Current Allowances

The following are currently allowed due to technical requirements:

- **`'unsafe-inline'` for scripts**: Required for Next.js and inline scripts
- **`'unsafe-eval'` for scripts**: May be required for GTM and AdSense
- **`'unsafe-inline'` for styles**: Required for styled-components and CSS-in-JS

### Future Improvements

Consider implementing:

1. **Nonce-based CSP**: Use Next.js `headers()` to generate nonces for inline scripts
2. **CSP reporting endpoint**: Set up a service to collect CSP violation reports
3. **Stricter directives**: Remove `'unsafe-*'` directives where possible
4. **SRI (Subresource Integrity)**: Add integrity checks for third-party scripts

## References

- [Next.js Security Headers Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Troubleshooting

### Resources Not Loading

1. Check browser console for CSP violation messages
2. Add the domain to appropriate CSP directive
3. Test in report-only mode first
4. Deploy and verify

### Headers Not Appearing

1. Verify `headers()` function in next.config
2. Check build output for errors
3. Verify package is properly installed
4. Clear Next.js cache: `rm -rf .next`

### Build Errors

1. Ensure TypeScript types are correct
2. Check package.json has correct dependencies
3. Run `pnpm install` to ensure packages are linked
4. Verify exports in package main files

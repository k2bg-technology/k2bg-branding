# @repo/security-headers

Shared security headers configuration for Next.js applications in the K2BG monorepo.

## Features

- **Content Security Policy (CSP)** - Prevents XSS and injection attacks
- **X-Frame-Options** - Prevents clickjacking attacks
- **X-Content-Type-Options** - Prevents MIME type sniffing
- **Referrer-Policy** - Controls referrer information leakage
- **Permissions-Policy** - Restricts browser features
- **Strict-Transport-Security (HSTS)** - Enforces HTTPS

## Usage

### Blog App

```typescript
import { createBlogSecurityHeaders } from 'security-headers';

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createBlogSecurityHeaders(true), // true = report-only mode
      },
    ];
  },
};
```

### Portfolio App

```typescript
import { createPortfolioSecurityHeaders } from 'security-headers';

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createPortfolioSecurityHeaders(true), // true = report-only mode
      },
    ];
  },
};
```

### Custom Configuration

```typescript
import { createSecurityHeaders } from 'security-headers';

const headers = createSecurityHeaders({
  csp: {
    reportOnly: true, // Start with report-only mode
    scriptSrc: ["'unsafe-inline'", 'https://example.com'],
    styleSrc: ["'unsafe-inline'"],
    imgSrc: ['data:', 'https://cdn.example.com'],
    fontSrc: ['https://fonts.gstatic.com'],
    connectSrc: ['https://api.example.com'],
  },
  hsts: true,
});
```

## Rollout Strategy

1. **Start with report-only mode** (`reportOnly: true`)
   - Monitor browser console for CSP violations
   - Check that all resources load correctly
   - No user impact during testing phase

2. **Review and adjust allowlists**
   - Add missing domains to CSP directives
   - Remove overly permissive rules

3. **Enable enforcement** (`reportOnly: false`)
   - Browser will block violating resources
   - Monitor for issues in production

## CSP Directives

### Blog App Allowlists

- **Google Tag Manager**: `www.googletagmanager.com`
- **Google Analytics**: `www.google-analytics.com`
- **Google AdSense**: `pagead2.googlesyndication.com`
- **Cloudinary**: `res.cloudinary.com`
- **Instagram CDN**: `*.cdninstagram.com`
- **Unsplash**: `images.unsplash.com`
- **AWS S3**: `*.amazonaws.com`

### Portfolio App Allowlists

- Minimal external resources
- Only Google Fonts for typography

## Security Considerations

- `'unsafe-inline'` is used for scripts/styles (required for Next.js)
- Consider implementing nonce-based CSP for stricter security
- `'unsafe-eval'` may be needed for GTM and AdSense
- HSTS is enabled by default (63072000 seconds = 2 years)

## References

- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)

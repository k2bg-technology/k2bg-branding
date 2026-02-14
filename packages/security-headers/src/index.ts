/**
 * Security Headers Configuration
 *
 * This module provides security header configurations for Next.js applications.
 * Headers are designed to protect against common web vulnerabilities while
 * allowing necessary external resources.
 */

export interface SecurityHeadersConfig {
  /**
   * Content Security Policy configuration
   */
  csp?: {
    /**
     * Use report-only mode (recommended for initial deployment)
     * This allows testing CSP without breaking functionality
     */
    reportOnly?: boolean;
    /**
     * Allowed script sources
     */
    scriptSrc?: string[];
    /**
     * Allowed style sources
     */
    styleSrc?: string[];
    /**
     * Allowed image sources
     */
    imgSrc?: string[];
    /**
     * Allowed font sources
     */
    fontSrc?: string[];
    /**
     * Allowed connect sources (for fetch, XHR, WebSocket)
     */
    connectSrc?: string[];
    /**
     * Allowed frame sources
     */
    frameSrc?: string[];
    /**
     * Allowed media sources (audio, video)
     */
    mediaSrc?: string[];
    /**
     * Allowed object sources (plugins)
     */
    objectSrc?: string[];
  };
  /**
   * Whether to include Strict-Transport-Security header
   */
  hsts?: boolean;
}

/**
 * Next.js header object type
 */
export interface NextHeader {
  key: string;
  value: string;
}

/**
 * Build Content-Security-Policy directive value
 */
function buildCSPDirective(config: SecurityHeadersConfig['csp']): string {
  const directives: string[] = [];

  // Default directive - fallback for all other directives
  directives.push("default-src 'self'");

  // Script sources
  if (config?.scriptSrc && config.scriptSrc.length > 0) {
    directives.push(`script-src 'self' ${config.scriptSrc.join(' ')}`);
  } else {
    directives.push("script-src 'self'");
  }

  // Style sources
  if (config?.styleSrc && config.styleSrc.length > 0) {
    directives.push(`style-src 'self' ${config.styleSrc.join(' ')}`);
  } else {
    directives.push("style-src 'self'");
  }

  // Image sources
  if (config?.imgSrc && config.imgSrc.length > 0) {
    directives.push(`img-src 'self' ${config.imgSrc.join(' ')}`);
  } else {
    directives.push("img-src 'self'");
  }

  // Font sources
  if (config?.fontSrc && config.fontSrc.length > 0) {
    directives.push(`font-src 'self' ${config.fontSrc.join(' ')}`);
  } else {
    directives.push("font-src 'self'");
  }

  // Connect sources (fetch, XHR, WebSocket)
  if (config?.connectSrc && config.connectSrc.length > 0) {
    directives.push(`connect-src 'self' ${config.connectSrc.join(' ')}`);
  } else {
    directives.push("connect-src 'self'");
  }

  // Frame sources
  if (config?.frameSrc && config.frameSrc.length > 0) {
    directives.push(`frame-src ${config.frameSrc.join(' ')}`);
  }

  // Media sources
  if (config?.mediaSrc && config.mediaSrc.length > 0) {
    directives.push(`media-src ${config.mediaSrc.join(' ')}`);
  }

  // Object sources (usually set to 'none' to prevent plugins)
  if (config?.objectSrc && config.objectSrc.length > 0) {
    directives.push(`object-src ${config.objectSrc.join(' ')}`);
  } else {
    directives.push("object-src 'none'");
  }

  return directives.join('; ');
}

/**
 * Generate security headers for Next.js
 *
 * @param config - Security headers configuration
 * @returns Array of Next.js header objects
 */
export function createSecurityHeaders(
  config: SecurityHeadersConfig = {}
): NextHeader[] {
  const headers: NextHeader[] = [];

  // Content Security Policy
  const cspValue = buildCSPDirective(config.csp);
  const cspHeaderKey = config.csp?.reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  headers.push({
    key: cspHeaderKey,
    value: cspValue,
  });

  // X-Frame-Options: Prevents clickjacking attacks
  headers.push({
    key: 'X-Frame-Options',
    value: 'DENY',
  });

  // X-Content-Type-Options: Prevents MIME type sniffing
  headers.push({
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  });

  // Referrer-Policy: Controls referrer information
  headers.push({
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  });

  // Permissions-Policy: Controls browser features
  headers.push({
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  });

  // Strict-Transport-Security: Enforces HTTPS (only in production)
  if (config.hsts !== false) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}

/**
 * Preset configuration for blog application
 * Includes allowlists for GTM, AdSense, Cloudinary, and Instagram
 */
export function createBlogSecurityHeaders(
  reportOnly = true
): NextHeader[] {
  return createSecurityHeaders({
    csp: {
      reportOnly,
      scriptSrc: [
        "'unsafe-inline'", // Required for Next.js and inline scripts
        "'unsafe-eval'", // May be required for GTM and AdSense
        'https://www.googletagmanager.com',
        'https://*.googletagmanager.com',
        'https://pagead2.googlesyndication.com',
        'https://*.google-analytics.com',
        'https://www.google-analytics.com',
      ],
      styleSrc: [
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
      ],
      imgSrc: [
        'data:',
        'blob:',
        'https://res.cloudinary.com',
        'https://*.cdninstagram.com',
        'https://images.unsplash.com',
        'https://*.amazonaws.com',
        'https://www.google-analytics.com',
        'https://*.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://*.googletagmanager.com',
        'https://pagead2.googlesyndication.com',
        'https://*.googlesyndication.com',
      ],
      fontSrc: [
        'https://fonts.gstatic.com',
      ],
      connectSrc: [
        'https://www.google-analytics.com',
        'https://*.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://*.googletagmanager.com',
        'https://pagead2.googlesyndication.com',
        'https://region1.google-analytics.com',
      ],
      frameSrc: [
        'https://www.googletagmanager.com',
        'https://pagead2.googlesyndication.com',
        'https://*.googlesyndication.com',
      ],
    },
    hsts: true,
  });
}

/**
 * Preset configuration for portfolio application
 * More restrictive CSP with minimal external resources
 */
export function createPortfolioSecurityHeaders(
  reportOnly = true
): NextHeader[] {
  return createSecurityHeaders({
    csp: {
      reportOnly,
      scriptSrc: [
        "'unsafe-inline'", // Required for Next.js inline scripts
      ],
      styleSrc: [
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
      ],
      imgSrc: [
        'data:',
        'blob:',
      ],
      fontSrc: [
        'https://fonts.gstatic.com',
      ],
    },
    hsts: true,
  });
}

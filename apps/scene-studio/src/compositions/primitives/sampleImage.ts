// Shared sample card for the shader-effect demos: high-contrast circles,
// stripes, and text make channel shifts and mosaic cells easy to read.
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><rect width="600" height="900" fill="#474a4d"/><circle cx="300" cy="300" r="180" fill="#b8d200"/><circle cx="300" cy="300" r="100" fill="#f8b500"/><rect x="60" y="560" width="480" height="16" fill="#f8b500"/><rect x="60" y="600" width="360" height="16" fill="#b8d200"/><rect x="60" y="640" width="420" height="16" fill="#ffffff"/><text x="300" y="810" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="#ffffff" text-anchor="middle">K2BG</text></svg>`;

export const SAMPLE_IMAGE_SOURCE = `data:image/svg+xml,${encodeURIComponent(sampleSvg)}`;

// Synthetic depth map matched to the card: the big circle reads as near
// (white), the frame edges as far (black) — the monocular-depth convention.
const sampleDepthSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><defs><radialGradient id="depth" cx="50%" cy="33.3%" r="66%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#888888"/><stop offset="100%" stop-color="#000000"/></radialGradient></defs><rect width="600" height="900" fill="url(#depth)"/></svg>`;

export const SAMPLE_DEPTH_SOURCE = `data:image/svg+xml,${encodeURIComponent(sampleDepthSvg)}`;

// Shared sample card for the shader-effect demos: high-contrast circles,
// stripes, and text make channel shifts and mosaic cells easy to read.
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><rect width="600" height="900" fill="#474a4d"/><circle cx="300" cy="300" r="180" fill="#b8d200"/><circle cx="300" cy="300" r="100" fill="#f8b500"/><rect x="60" y="560" width="480" height="16" fill="#f8b500"/><rect x="60" y="600" width="360" height="16" fill="#b8d200"/><rect x="60" y="640" width="420" height="16" fill="#ffffff"/><text x="300" y="810" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="#ffffff" text-anchor="middle">K2BG</text></svg>`;

export const SAMPLE_IMAGE_SOURCE = `data:image/svg+xml,${encodeURIComponent(sampleSvg)}`;

import type { ImageLoaderProps } from 'next/image';

const generatedWidths = [640, 1080, 1920] as const;
const generatedWidthsByImage: Record<string, readonly number[]> = {
  'background-pattern': [640, 1080, 1440],
  blog: [640],
  'contact-pattern': [640, 1080, 1440],
  hero: [640],
  mobile: [640],
  'skill-pattern': [640, 1080, 1440],
  stock: [640],
  web: [640],
};
const localJpegPattern = /^\/images\/([^/?]+)\.jpg$/;

// biome-ignore lint/style/noDefaultExport: Next.js custom loader files require a default export.
export default function imageLoader({ src, width }: ImageLoaderProps) {
  const match = src.match(localJpegPattern);

  if (!match || match[1] === 'hero-og') {
    return src;
  }

  const widths = generatedWidthsByImage[match[1]] ?? generatedWidths;
  const generatedWidth =
    widths.find((candidateWidth) => width <= candidateWidth) ?? widths.at(-1);

  // AVIF is broadly supported in 2026 browsers, so Workers can serve static variants only.
  return `/images/generated/${match[1]}-w${generatedWidth}.avif`;
}

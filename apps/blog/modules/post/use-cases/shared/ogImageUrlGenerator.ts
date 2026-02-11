/**
 * Port for generating OG image URLs optimized for social media sharing.
 */
export interface OgImageUrlGenerator {
  generate(publicId: string): string;
}

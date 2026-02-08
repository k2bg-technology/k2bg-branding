import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';

export interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

let isConfigured = false;

/**
 * Configure the Cloudinary SDK.
 * This should be called once before using any Cloudinary operations.
 */
export function configureCloudinary(config?: CloudinaryConfig): void {
  cloudinary.config({
    cloud_name: config?.cloudName ?? process.env.CLOUDINARY_CLOUD_NAME,
    api_key: config?.apiKey ?? process.env.CLOUDINARY_API_KEY,
    api_secret: config?.apiSecret ?? process.env.CLOUDINARY_API_SECRET,
  });
  isConfigured = true;
}

/**
 * Ensure Cloudinary is configured before use.
 */
function ensureConfigured(): void {
  if (!isConfigured) {
    configureCloudinary();
  }
}

/**
 * Get the configured Cloudinary instance.
 */
export function getCloudinary(): typeof cloudinary {
  ensureConfigured();
  return cloudinary;
}

/**
 * Upload a file to Cloudinary.
 */
export async function uploadFile(
  fileUrl: string,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  ensureConfigured();
  return cloudinary.uploader.upload(fileUrl, options);
}

/**
 * Upload an image with standard options.
 */
export async function uploadImage(
  id: string,
  sourceUrl: string
): Promise<UploadApiResponse> {
  return uploadFile(sourceUrl, {
    public_id: id,
    overwrite: true,
    invalidate: true,
  });
}

/**
 * Get resource information from Cloudinary.
 */
export async function getResource(publicId: string) {
  ensureConfigured();
  return cloudinary.api.resource(publicId);
}

/**
 * Build a Cloudinary image URL with transformations.
 */
export function buildImageUrl(
  publicId: string,
  options?: {
    format?: string;
    quality?: string;
    width?: number;
    effect?: string;
  }
): string {
  ensureConfigured();

  const transformations: string[] = [];

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }
  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }
  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options?.effect) {
    transformations.push(`e_${options.effect}`);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformation = transformations.length > 0 ? transformations.join(',') : '';

  const parts = [baseUrl, transformation, publicId].filter(Boolean);
  return parts.join('/');
}

/**
 * Reset Cloudinary configuration state.
 * Primarily used for testing cleanup.
 */
export function resetCloudinaryConfig(): void {
  isConfigured = false;
}

export { cloudinary };
export type { UploadApiOptions, UploadApiResponse };

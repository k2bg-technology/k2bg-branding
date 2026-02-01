import { getResource } from './client';

/**
 * Fetch the version number of an image from Cloudinary.
 */
export async function fetchImageVersion(publicId: string): Promise<string> {
  const resource = await getResource(publicId);
  return String(resource.version);
}

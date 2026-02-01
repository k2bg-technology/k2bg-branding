import type { MediaType } from '../../domain';

/**
 * Output DTO for social post
 */
export interface SocialPostOutput {
  id: string;
  mediaUrl: string;
  displayUrl: string;
  permalink: string;
  mediaType: MediaType;
  caption?: string;
  timestamp: Date;
}

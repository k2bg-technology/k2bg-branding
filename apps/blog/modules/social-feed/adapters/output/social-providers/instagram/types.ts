/**
 * Instagram Graph API response types
 */

export interface InstagramMediaListResponse {
  data?: { id: string }[];
}

export interface InstagramMediaDetailResponse {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  caption?: string;
}

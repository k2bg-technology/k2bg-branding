export interface Media {
  id: string;
  name?: string;
  type?: string;
  width?: number;
  height?: number;
  targetUrl?: string;
  sourceUrl?: string;
  sourceFile?: string;
}

export type MediaImage = Media;

export type MediaVideo = Media;

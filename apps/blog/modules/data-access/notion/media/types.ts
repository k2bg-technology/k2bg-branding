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

export interface MediaImage extends Media {}

export interface MediaVideo extends Media {}

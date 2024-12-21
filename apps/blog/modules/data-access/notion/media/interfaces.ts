export interface MediaCore {
  id: string;
  name?: string;
  type?: string;
  width?: number;
  height?: number;
  targetUrl?: string;
  sourceUrl?: string;
  sourceFile?: string;
}

export interface MediaImage extends MediaCore {}

export interface MediaVideo extends MediaCore {}

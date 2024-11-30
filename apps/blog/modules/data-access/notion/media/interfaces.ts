export interface MediaCore {
  name: string;
  type: string;
  width: number;
  height: number;
  linkText?: string;
  linkUrl?: string;
  url?: string;
  file?: string;
}

export interface MediaImage extends MediaCore {}

export interface MediaVideo extends MediaCore {}

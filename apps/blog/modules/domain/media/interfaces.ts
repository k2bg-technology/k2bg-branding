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

export interface MediaImage extends MediaCore {
  placeholder?: Promise<string>;
}

export interface MediaVideo extends MediaCore {}

export interface MediaData {
  id: string;
  getTitle: (propertyName: string) => string | undefined;
  getRichText: (propertyName: string) => string | undefined;
  getNumber: (propertyName: string) => number | undefined;
  getSelect: (propertyName: string) => string | undefined;
  getUrl: (propertyName: string) => string | undefined;
  getRelations: (propertyName: string) => string[];
  getFiles: (propertyName: string) => string[] | undefined;
}

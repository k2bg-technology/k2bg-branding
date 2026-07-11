export interface ImageSourceRecord {
  id: string;
  url: string;
}

export interface ExternalImageSource {
  fetchImageSources(): Promise<ImageSourceRecord[]>;
}

export interface ImageRepository {
  uploadImage(id: string, sourceUrl: string): Promise<void>;
}

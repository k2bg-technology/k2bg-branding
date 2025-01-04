export interface Repository {
  getOptimizedImageUrl: (id: string) => string;
  getPlaceholderImageUrl: (id: string) => string;
  uploadImage: (id: string, fileUrl: string) => Promise<void>;
}

export interface InputRepository {
  getAllImageSources: () => Promise<
    {
      id: string;
      url: string;
    }[]
  >;
}

import * as Domain from '../../domain';

export class UpsertImages {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private InputPostRepository: Domain.Post.InputRepository,
    private InputMediaRepository: Domain.Media.InputRepository,
    private InputAffiliateRepository: Domain.Affiliate.InputRepository,
    private ImageRepository: Domain.Image.Repository // eslint-disable-next-line no-empty-function
  ) {}

  async execute() {
    const images = [
      ...(await this.InputPostRepository.getAllHeroImageSources()),
      ...(await this.InputMediaRepository.getAllImageSources()),
      ...(await this.InputAffiliateRepository.getAllImageSources()),
    ];

    await Promise.all(
      images.map(async (image) =>
        this.ImageRepository.uploadImage(image.id, image.url)
      )
    );

    return images;
  }
}

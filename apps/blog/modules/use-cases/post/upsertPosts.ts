import * as Domain from '../../domain';

export class UpsertPosts {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private InputPostRepository: Domain.Post.InputRepository,
    private OutputPostRepository: Domain.Post.OutputRepository // eslint-disable-next-line no-empty-function
  ) {}

  async execute() {
    const posts = await this.InputPostRepository.getAllPosts();
    await this.OutputPostRepository.upsertAllPosts(posts);

    return posts;
  }
}

import * as Domain from '../../domain';

export class UpsertPosts {
  constructor(
    private InputPostRepository: Domain.Post.InputRepository,
    private OutputPostRepository: Domain.Post.OutputRepository
  ) {}

  async execute() {
    const posts = await this.InputPostRepository.getAllPosts();
    await this.OutputPostRepository.upsertAllPosts(posts);

    return posts;
  }
}

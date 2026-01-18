import { PostId, type PostRepository } from '../../../domain';
import { PostNotFoundError, type PostOutput, toPostOutput } from '../../shared';

export interface FetchPostInput {
  id: string;
}

export interface FetchPostOutput {
  post: PostOutput;
}

/**
 * FetchPost Use Case
 *
 * Fetches a single post by its ID.
 */
export class FetchPost {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: FetchPostInput): Promise<FetchPostOutput> {
    const postId = PostId.create(input.id);
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new PostNotFoundError(input.id);
    }

    return {
      post: toPostOutput(post),
    };
  }
}

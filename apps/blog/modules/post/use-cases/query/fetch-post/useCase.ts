import { PostId } from '../../../domain';
import { PostNotFoundError, type PostOutput, toPostOutput } from '../../shared';
import type { FetchPostQueryService } from './queryService';

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
  constructor(private readonly queryService: FetchPostQueryService) {}

  async execute(input: FetchPostInput): Promise<FetchPostOutput> {
    const postId = PostId.create(input.id);
    const result = await this.queryService.fetchPost(postId);

    if (!result) {
      throw new PostNotFoundError(input.id);
    }

    return {
      post: toPostOutput(result.post, result.author),
    };
  }
}

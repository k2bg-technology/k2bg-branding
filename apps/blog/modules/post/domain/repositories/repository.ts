import type { Post } from '../entities/entity';
import type { PostId } from '../value-objects/postId';

export interface PostRepository {
  findById(id: PostId): Promise<Post | null>;

  save(post: Post): Promise<void>;

  delete(id: PostId): Promise<void>;
}

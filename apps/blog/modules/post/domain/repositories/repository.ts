import type { Post } from '../entities/entity';
import type { PostId } from '../value-objects/postId';

/**
 * PostRepository Interface
 *
 * Defines the contract for Post persistence operations.
 * This interface is part of the domain layer and should be
 * implemented by adapters in the infrastructure layer.
 */
export interface PostRepository {
  /**
   * Find a post by its unique identifier
   */
  findById(id: PostId): Promise<Post | null>;

  /**
   * Save a post (create or update)
   */
  save(post: Post): Promise<void>;

  /**
   * Delete a post by its ID
   */
  delete(id: PostId): Promise<void>;
}

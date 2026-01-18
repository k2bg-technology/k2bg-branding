# TypeScript Implementation Examples

Concrete code examples demonstrating Clean Architecture with correct dependency direction.

## Table of Contents

- [TypeScript Implementation Examples](#typescript-implementation-examples)
  - [Table of Contents](#table-of-contents)
  - [Value Objects](#value-objects)
    - [PostId](#postid)
    - [Category](#category)
    - [Tags](#tags)
  - [Entity](#entity)
  - [Repository Interface (Output Port)](#repository-interface-output-port)
  - [Use Case with Input Port](#use-case-with-input-port)
    - [Another Use Case Example](#another-use-case-example)
  - [Presenter (Output Formatting)](#presenter-output-formatting)
  - [Mapper (Data Transformation)](#mapper-data-transformation)
  - [Repository Implementation](#repository-implementation)
  - [Input Adapter (Controller)](#input-adapter-controller)
  - [Dependency Injection](#dependency-injection)
    - [Usage in Next.js API Route](#usage-in-nextjs-api-route)
  - [Summary: Correct Dependency Direction](#summary-correct-dependency-direction)

**Dependency Flow:**
```
Controllers → Use Cases → Domain (Entities + Repository Interfaces)
                             ↑
Repository Implementations ──┘ (implements interface)
                             ↑
Infrastructure (shared) ─────┘ (used by adapters only)
```

---

## Value Objects

Value Objects are immutable and compared by their attribute values.

### PostId

```typescript
// modules/post/domain/value-objects/id.ts

export class PostId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('PostId cannot be empty');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PostId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static generate(): PostId {
    return new PostId(crypto.randomUUID());
  }
}
```

### Category

```typescript
// modules/post/domain/value-objects/category.ts

export class Category {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Category): boolean {
    return this.value === other.value;
  }

  static create(value: string): Category {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('Category cannot be empty');
    }
    if (trimmed.length > 50) {
      throw new Error('Category must be 50 characters or less');
    }
    return new Category(trimmed);
  }

  // Predefined categories
  static readonly TECHNOLOGY = new Category('Technology');
  static readonly DESIGN = new Category('Design');
  static readonly BUSINESS = new Category('Business');
}
```

### Tags

```typescript
// modules/post/domain/value-objects/tags.ts

export class Tags {
  private readonly values: ReadonlyArray<string>;

  private constructor(values: string[]) {
    this.values = Object.freeze([...values]);
  }

  getValues(): ReadonlyArray<string> {
    return this.values;
  }

  contains(tag: string): boolean {
    return this.values.includes(tag.toLowerCase());
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }

  count(): number {
    return this.values.length;
  }

  equals(other: Tags): boolean {
    if (this.values.length !== other.values.length) {
      return false;
    }
    return this.values.every((tag) => other.values.includes(tag));
  }

  static create(values: string[]): Tags {
    const normalized = values
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0);

    const unique = Array.from(new Set(normalized));

    if (unique.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }

    return new Tags(unique);
  }

  static empty(): Tags {
    return new Tags([]);
  }
}
```

---

## Entity

Entities have unique identity and contain business logic.

```typescript
// modules/post/domain/entities/entity.ts

import { PostId } from '../value-objects/id';
import { Category } from '../value-objects/category';
import { Tags } from '../value-objects/tags';

export const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export class Post {
  private constructor(
    private readonly _id: PostId,
    private _title: string,
    private _content: string,
    private _category: Category,
    private _tags: Tags,
    private _status: PostStatus,
    private _publishedAt: Date | null,
    private readonly _createdAt: Date
  ) {}

  // Getters
  get id(): PostId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get category(): Category {
    return this._category;
  }

  get tags(): Tags {
    return this._tags;
  }

  get status(): PostStatus {
    return this._status;
  }

  get publishedAt(): Date | null {
    return this._publishedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business Logic
  publish(): void {
    if (this._status === PostStatus.PUBLISHED) {
      throw new Error('Post is already published');
    }
    if (this._status === PostStatus.ARCHIVED) {
      throw new Error('Cannot publish an archived post');
    }
    this._status = PostStatus.PUBLISHED;
    this._publishedAt = new Date();
  }

  archive(): void {
    if (this._status === PostStatus.ARCHIVED) {
      throw new Error('Post is already archived');
    }
    this._status = PostStatus.ARCHIVED;
  }

  updateContent(title: string, content: string): void {
    if (this._status === PostStatus.ARCHIVED) {
      throw new Error('Cannot update an archived post');
    }
    if (!title.trim()) {
      throw new Error('Title cannot be empty');
    }
    this._title = title.trim();
    this._content = content;
  }

  changeCategory(category: Category): void {
    this._category = category;
  }

  updateTags(tags: Tags): void {
    this._tags = tags;
  }

  isPublished(): boolean {
    return this._status === PostStatus.PUBLISHED;
  }

  equals(other: Post): boolean {
    return this._id.equals(other._id);
  }

  // Factory methods
  static createDraft(
    title: string,
    content: string,
    category: Category,
    tags: Tags = Tags.empty()
  ): Post {
    // Enforce invariants at creation
    if (!title || !title.trim()) {
      throw new Error('Title cannot be empty');
    }
    if (!content || !content.trim()) {
      throw new Error('Content cannot be empty');
    }

    return new Post(
      PostId.generate(),
      title.trim(),
      content.trim(),
      category,
      tags,
      PostStatus.DRAFT,
      null,
      new Date()
    );
  }

  // Reconstitution from persistence
  static reconstitute(
    id: PostId,
    title: string,
    content: string,
    category: Category,
    tags: Tags,
    status: PostStatus,
    publishedAt: Date | null,
    createdAt: Date
  ): Post {
    // Enforce state consistency invariants
    if (status === PostStatus.PUBLISHED && !publishedAt) {
      throw new Error(
        'Invariant violation: Published post must have publishedAt date'
      );
    }
    if (status !== PostStatus.PUBLISHED && publishedAt) {
      throw new Error(
        'Invariant violation: Non-published post cannot have publishedAt date'
      );
    }

    return new Post(
      id,
      title,
      content,
      category,
      tags,
      status,
      publishedAt,
      createdAt
    );
  }
}
```

---

## Repository Interface (Output Port)

**CRITICAL**: This interface lives in `modules/{module}/domain/repositories`, NOT in infrastructure.

```typescript
// modules/post/domain/repositories/repository.ts

import { Post } from '../entities/entity';
import { PostId } from '../value-objects/id';
import { Category } from '../value-objects/category';

/**
 * Repository interface (Output Port)
 * - Defined in DOMAIN layer (modules/post/domain/repositories/)
 * - Implemented by ADAPTER layer (modules/post/adapters/output/repositories/)
 * - Use Cases depend on THIS interface, not the implementation
 */
export interface PostRepository {
  /**
   * Find a post by its unique identifier
   * Returns null if not found (expected case)
   * @throws RepositoryError if operation fails (connection error, etc.)
   */
  findById(id: PostId): Promise<Post | null>;

  /**
   * Find all published posts
   * @throws RepositoryError if operation fails
   */
  findPublished(): Promise<Post[]>;

  /**
   * Find published posts by category
   * @throws RepositoryError if operation fails
   */
  findPublishedByCategory(category: Category): Promise<Post[]>;

  /**
   * Save a post (create or update)
   * @throws RepositoryError if operation fails
   */
  save(post: Post): Promise<void>;

  /**
   * Delete a post by its identifier
   * @throws RepositoryError if operation fails
   */
  delete(id: PostId): Promise<void>;
}

/**
 * Repository Error (Infrastructure-level)
 * - Thrown when data access fails (connection, query error, etc.)
 * - NOT for "not found" (use null for that)
 * - Preserves original error as cause for debugging
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
```

---

## Use Case with Input Port

Input Port is an optional interface that defines the use case contract.

```typescript
// modules/post/use-cases/get-published/port.ts

/**
 * Input Port (optional but recommended for clarity)
 * Defines the use case contract
 */
export interface GetPublishedPostsPort {
  execute(): Promise<PublishedPostDTO[]>;
}

/**
 * Application DTO - free from presentation concerns
 * Does NOT include UI-specific formatting like excerpt
 */
export interface PublishedPostDTO {
  id: string;
  title: string;
  content: string;        // Full content, not excerpt
  category: string;
  tags: string[];
  publishedAt: string;
}
```

```typescript
// modules/post/use-cases/get-published/use-case.ts

import { PostRepository } from '../../domain/repositories/repository';
import { Post } from '../../domain/entities/entity';
import { GetPublishedPostsPort, PublishedPostDTO } from './port';

/**
 * Use Case implementation
 * - Depends ONLY on domain (entities + repository interface)
 * - NO dependency on infrastructure
 * - NO presentation logic (no excerpt generation, no UI formatting)
 * - Returns application DTOs with complete data
 */
export class GetPublishedPostsUseCase implements GetPublishedPostsPort {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(): Promise<PublishedPostDTO[]> {
    const posts = await this.postRepository.findPublished();
    return posts.map(this.toDTO);
  }

  /**
   * Maps domain entity to application DTO
   * Does NOT perform presentation formatting
   */
  private toDTO(post: Post): PublishedPostDTO {
    return {
      id: post.id.getValue(),
      title: post.title,
      content: post.content,  // Full content, not excerpt
      category: post.category.getValue(),
      tags: [...post.tags.getValues()],
      publishedAt: post.publishedAt?.toISOString() ?? '',
    };
  }
}
```

### Another Use Case Example

```typescript
// modules/post/use-cases/publish/port.ts

export interface PublishPostPort {
  execute(input: PublishPostInput): Promise<PublishPostOutput>;
}

export interface PublishPostInput {
  postId: string;
}

export interface PublishPostOutput {
  success: boolean;
  publishedAt: string;
}

/**
 * Use Case Errors (Application-level)
 * - NOT infrastructure errors (don't extend RepositoryError)
 * - Represent business logic failures
 */
export class PostNotFoundError extends Error {
  constructor(
    public readonly postId: PostId
  ) {
    super(`Post not found: ${postId.getValue()}`);
    this.name = 'PostNotFoundError';
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}
```

```typescript
// modules/post/use-cases/publish/use-case.ts

import { PostRepository } from '../../domain/repositories/repository';
import { PostId } from '../../domain/value-objects/id';
import {
  PublishPostPort,
  PublishPostInput,
  PublishPostOutput,
  PostNotFoundError,
  InvalidInputError,
} from './port';

export class PublishPostUseCase implements PublishPostPort {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: PublishPostInput): Promise<PublishPostOutput> {
    // Validate input
    if (!input.postId?.trim()) {
      throw new InvalidInputError('Post ID is required');
    }

    const postId = new PostId(input.postId);

    // Retrieve the post (null = not found)
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new PostNotFoundError(postId);
    }

    // Execute domain logic
    post.publish();

    // Persist changes
    await this.postRepository.save(post);

    return {
      success: true,
      publishedAt: post.publishedAt!.toISOString(),
    };
  }
}
```

---

## Presenter (Output Formatting)

Presenters handle response formatting and UI-specific concerns.

```typescript
// modules/post/adapters/input/presenters/presenter.ts

import { PublishedPostDTO } from '../../../use-cases/get-published/port';

/**
 * Response format for API/UI
 * Contains presentation-specific fields like excerpt
 */
export interface PublishedPostResponse {
  id: string;
  title: string;
  excerpt: string;        // UI-specific: truncated content
  category: string;
  tags: string[];
  publishedAt: string;
}

/**
 * Presenter (Output Adapter)
 * - Handles response formatting
 * - Contains UI/presentation logic (excerpt, date formatting, etc.)
 * - Separated from business logic (Use Case)
 */
export class PostPresenter {
  /**
   * Format published posts for API response
   */
  formatPublishedPosts(dtos: PublishedPostDTO[]): PublishedPostResponse[] {
    return dtos.map((dto) => this.formatPublishedPost(dto));
  }

  /**
   * Format single post for API response
   */
  formatPublishedPost(dto: PublishedPostDTO): PublishedPostResponse {
    return {
      id: dto.id,
      title: dto.title,
      excerpt: this.createExcerpt(dto.content),  // Presentation logic here
      category: dto.category,
      tags: dto.tags,
      publishedAt: dto.publishedAt,
    };
  }

  /**
   * Presentation logic: Create excerpt from content
   * This is UI-specific and does NOT belong in Use Case
   */
  private createExcerpt(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }
}
```

---

## Mapper (Data Transformation)

Mappers handle transformation between domain models and persistence models.

```typescript
// modules/post/adapters/output/mappers/mapper.ts

import { Post, PostStatus } from '../../../domain/entities/entity';
import { PostId } from '../../../domain/value-objects/id';
import { Category } from '../../../domain/value-objects/category';
import { Tags } from '../../../domain/value-objects/tags';

// Notion page structure (simplified)
export interface NotionPostPage {
  id: string; // Notion page_id
  properties: {
    postId: { rich_text: Array<{ plain_text: string }> }; // Domain ID
    title: { title: Array<{ plain_text: string }> };
    content: { rich_text: Array<{ plain_text: string }> };
    category: { select: { name: string } | null };
    tags: { multi_select: Array<{ name: string }> };
    status: { select: { name: string } | null };
    publishedAt: { date: { start: string } | null };
    createdAt: { created_time: string };
  };
}

/**
 * Mapping Error (Infrastructure-level)
 * - Thrown when persistence data is invalid or corrupted
 * - Extends RepositoryError for consistent error handling
 */
export class MappingError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'MappingError';
  }
}

/**
 * PostMapper - Separates mapping logic from Repository
 * - Transforms between Domain and Persistence models
 * - Validates data integrity (throws MappingError on corruption)
 * - Keeps Repository focused on data access operations
 */
export class PostMapper {
  /**
   * Map Notion page to Domain entity
   * @throws MappingError if required data is missing or invalid
   */
  toDomain(page: NotionPostPage): Post {
    const props = page.properties;

    // Validate required fields BEFORE attempting to create domain objects
    const postIdText = props.postId.rich_text[0]?.plain_text;
    if (!postIdText) {
      throw new MappingError(
        `Missing postId in Notion page ${page.id}`
      );
    }

    const titleText = props.title.title[0]?.plain_text;
    if (!titleText) {
      throw new MappingError(
        `Missing title in Notion page ${page.id}`
      );
    }

    const createdTime = props.createdAt?.created_time;
    if (!createdTime) {
      throw new MappingError(
        `Missing createdAt in Notion page ${page.id}`
      );
    }

    try {
      return Post.reconstitute(
        new PostId(postIdText),
        titleText,
        props.content.rich_text.map((t) => t.plain_text).join(''),
        Category.create(props.category.select?.name ?? 'Uncategorized'),
        Tags.create(props.tags.multi_select.map((t) => t.name)),
        this.mapStatus(props.status.select?.name),
        props.publishedAt?.date ? new Date(props.publishedAt.date.start) : null,
        new Date(createdTime)
      );
    } catch (error) {
      // Wrap domain errors (invariant violations) as MappingError
      throw new MappingError(
        `Failed to reconstitute Post from Notion page ${page.id}: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * Map Domain entity to Notion properties
   */
  toPersistence(post: Post): Record<string, unknown> {
    const properties: Record<string, unknown> = {
      postId: {
        rich_text: [{ text: { content: post.id.getValue() } }],
      },
      title: {
        title: [{ text: { content: post.title } }],
      },
      content: {
        rich_text: [{ text: { content: post.content } }],
      },
      category: {
        select: { name: post.category.getValue() },
      },
      tags: {
        multi_select: post.tags.getValues().map((t) => ({ name: t })),
      },
      status: {
        select: { name: post.status },
      },
    };

    // Only include publishedAt if it has a value
    // Notion API requires { date: { start: ... } } or omit the property entirely
    if (post.publishedAt) {
      properties.publishedAt = {
        date: { start: post.publishedAt.toISOString() },
      };
    }

    return properties;
  }

  private mapStatus(status: string | undefined) {
    switch (status) {
      case 'published':
        return PostStatus.PUBLISHED;
      case 'archived':
        return PostStatus.ARCHIVED;
      default:
        return PostStatus.DRAFT;
    }
  }
}
```

---

## Repository Implementation

Implementation in adapters layer with **proper ID separation**.

```typescript
// modules/post/adapters/output/repositories/notion.ts

import { Client } from '@notionhq/client';
import { Post } from '../../../domain/entities/entity';
import { PostId } from '../../../domain/value-objects/id';
import { Category } from '../../../domain/value-objects/category';
import {
  PostRepository,
  RepositoryError,
} from '../../../domain/repositories/repository';
import {
  PostMapper,
  NotionPostPage,
  MappingError,
} from '../mappers/mapper';

/**
 * Notion implementation of PostRepository
 *
 * IMPORTANT: Separates Domain ID from Notion page_id
 * - Domain PostId: Business identifier (UUID)
 * - Notion page_id: Infrastructure identifier
 * - Stores Domain PostId in a Notion property
 * - Uses PostMapper for data transformation
 */
export class NotionPostRepository implements PostRepository {
  private readonly mapper = new PostMapper();

  constructor(
    private readonly client: Client,
    private readonly databaseId: string
  ) {}

  async findById(id: PostId): Promise<Post | null> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'postId',
          rich_text: {
            equals: id.getValue(),
          },
        },
      });

      if (response.results.length === 0) {
        return null;
      }

      return this.mapper.toDomain(response.results[0] as NotionPostPage);
    } catch (error) {
      // DO NOT swallow all errors as null
      if (this.isNotFoundError(error)) {
        return null;
      }

      // MappingError indicates corrupted data
      if (error instanceof MappingError) {
        throw new RepositoryError(
          `Data corruption in post ${id.getValue()}: ${error.message}`,
          error
        );
      }

      // Other errors (connection, API failures)
      throw new RepositoryError(
        `Failed to find post: ${id.getValue()}`,
        error
      );
    }
  }

  async findPublished(): Promise<Post[]> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'status',
          select: {
            equals: 'published',
          },
        },
        sorts: [
          {
            property: 'publishedAt',
            direction: 'descending',
          },
        ],
      });

      return response.results.map((page) =>
        this.mapper.toDomain(page as NotionPostPage)
      );
    } catch (error) {
      if (error instanceof MappingError) {
        throw new RepositoryError(
          `Data corruption in published posts: ${error.message}`,
          error
        );
      }
      throw new RepositoryError('Failed to find published posts', error);
    }
  }

  async findPublishedByCategory(category: Category): Promise<Post[]> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          and: [
            {
              property: 'status',
              select: { equals: 'published' },
            },
            {
              property: 'category',
              select: { equals: category.getValue() },
            },
          ],
        },
      });

      return response.results.map((page) =>
        this.mapper.toDomain(page as NotionPostPage)
      );
    } catch (error) {
      if (error instanceof MappingError) {
        throw new RepositoryError(
          `Data corruption in category ${category.getValue()}: ${error.message}`,
          error
        );
      }
      throw new RepositoryError(
        `Failed to find posts by category: ${category.getValue()}`,
        error
      );
    }
  }

  async save(post: Post): Promise<void> {
    try {
      // Check if post exists in Notion
      const existing = await this.findNotionPageByPostId(post.id);

      if (existing) {
        // Update existing
        await this.updatePage(existing.id, post);
      } else {
        // Create new
        await this.createPage(post);
      }
    } catch (error) {
      throw new RepositoryError(
        `Failed to save post: ${post.id.getValue()}`,
        error
      );
    }
  }

  async delete(id: PostId): Promise<void> {
    try {
      const page = await this.findNotionPageByPostId(id);
      if (!page) {
        return; // Idempotent delete
      }

      await this.client.pages.update({
        page_id: page.id,
        archived: true,
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete post: ${id.getValue()}`,
        error
      );
    }
  }

  // Private helpers

  private async findNotionPageByPostId(postId: PostId): Promise<NotionPostPage | null> {
    const response = await this.client.databases.query({
      database_id: this.databaseId,
      filter: {
        property: 'postId',
        rich_text: {
          equals: postId.getValue(),
        },
      },
    });

    return response.results.length > 0
      ? (response.results[0] as NotionPostPage)
      : null;
  }

  private async createPage(post: Post): Promise<void> {
    await this.client.pages.create({
      parent: { database_id: this.databaseId },
      properties: this.mapper.toPersistence(post),
    });
  }

  private async updatePage(pageId: string, post: Post): Promise<void> {
    await this.client.pages.update({
      page_id: pageId,
      properties: this.mapper.toPersistence(post),
    });
  }

  private isNotFoundError(error: unknown): boolean {
    // Notion-specific not found check
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'object_not_found'
    );
  }
}
```

---

## Input Adapter (Controller)

```typescript
// modules/post/adapters/input/controllers/controller.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { GetPublishedPostsPort } from '../../../use-cases/get-published/port';
import { PostPresenter } from '../presenters/presenter';
import { RepositoryError } from '../../../domain/repositories/repository';
import { PostNotFoundError } from '../../../use-cases/publish/port';

/**
 * Controller (Input Adapter)
 * - Depends on Use Case Port (interface), not implementation
 * - Uses Presenter to format responses
 * - Handles HTTP concerns (request/response, status codes)
 * - Does NOT contain business logic or presentation logic
 */
export class PostController {
  constructor(
    private readonly getPublishedPosts: GetPublishedPostsPort,
    private readonly presenter: PostPresenter
  ) {}

  async handleGetPublishedPosts(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Use Case returns application DTOs
      const dtos = await this.getPublishedPosts.execute();
      
      // Presenter formats for API response
      const response = this.presenter.formatPublishedPosts(dtos);
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Failed to fetch posts:', error);

      // CRITICAL: Error mapping order matters!
      // Check specific errors BEFORE generic ones

      // 1. Application errors (404)
      if (error instanceof PostNotFoundError) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // 2. Infrastructure errors (503)
      if (error instanceof RepositoryError) {
        res.status(503).json({ error: 'Service temporarily unavailable' });
        return;
      }

      // 3. Unknown errors (500)
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

---

## Dependency Injection

Wire dependencies at composition root with **correct dependency direction**.

```typescript
// infrastructure/di/container.ts

import { Client } from '@notionhq/client';
import { PostRepository } from '../../modules/post/domain/repositories/repository';
import { NotionPostRepository } from '../../modules/post/adapters/output/repositories/notion';
import { GetPublishedPostsUseCase } from '../../modules/post/use-cases/get-published/use-case';
import { PublishPostUseCase } from '../../modules/post/use-cases/publish/use-case';
import { PostController } from '../../modules/post/adapters/input/controllers/controller';
import { PostPresenter } from '../../modules/post/adapters/input/presenters/presenter';

/**
 * Dependency Injection Container
 *
 * Dependency Flow (compile-time):
 * Controllers → Use Cases → Domain Interfaces
 *                             ↑
 * Repository Implementation ──┘
 */
export class Container {
  private static instance: Container;

  private readonly postRepository: PostRepository;
  private readonly getPublishedPostsUseCase: GetPublishedPostsUseCase;
  private readonly publishPostUseCase: PublishPostUseCase;
  private readonly postPresenter: PostPresenter;
  private readonly postController: PostController;

  private constructor() {
    // Create infrastructure dependencies
    const notionClient = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Create repository (implements interface from domain)
    this.postRepository = new NotionPostRepository(
      notionClient,
      process.env.NOTION_DATABASE_ID!
    );

    // Create use cases (depend only on repository INTERFACE)
    this.getPublishedPostsUseCase = new GetPublishedPostsUseCase(
      this.postRepository
    );
    this.publishPostUseCase = new PublishPostUseCase(this.postRepository);

    // Create presenter (handles response formatting)
    this.postPresenter = new PostPresenter();

    // Create controller (depends on use case interface + presenter)
    this.postController = new PostController(
      this.getPublishedPostsUseCase,
      this.postPresenter
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  getPostController(): PostController {
    return this.postController;
  }
}

// Export for API routes
export const container = Container.getInstance();
```

### Usage in Next.js API Route

```typescript
// pages/api/posts/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from '../../../infrastructure/di/container';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = container.getPostController();
  await controller.handleGetPublishedPosts(req, res);
}
```

---

## Summary: Correct Dependency Direction

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Adapters (Input/Output)                          │
│  ┌──────────────┐                              ┌─────────────────┐  │
│  │  Controller  │                              │  Notion Repo    │  │
│  │              │                              │  Implementation │  │
│  └──────┬───────┘                              └────────┬────────┘  │
│         │ depends on                                    │           │
│         │                                               │           │
└─────────┼───────────────────────────────────────────────┼───────────┘
          │                                               │
          ▼                                               │ implements
┌─────────┴───────────────────────────────────────────────┴───────────┐
│                         Use Cases                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  GetPublishedPostsUseCase                                    │   │
│  │  depends on PostRepository INTERFACE ↓                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ depends on
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Domain                                   │
│  ┌────────────────┐    ┌──────────────────────────────────────────┐ │
│  │   Entities     │    │   Repository Interfaces (Output Ports)   │ │
│  │   (Post, etc.) │    │   - PostRepository interface             │ │
│  └────────────────┘    └──────────────────────────────────────────┘ │
│                                                                     │
│  NO DEPENDENCIES - Pure business logic                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Principles:**
1. Repository **interface** lives in Domain, **implementation** in Adapters
2. Use Cases depend only on Domain (never on infrastructure)
3. Adapters implement interfaces defined by inner layers
4. Domain has ZERO external dependencies

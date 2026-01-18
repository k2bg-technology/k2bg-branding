# Clean Architecture Patterns

Controlling the direction of dependencies. This is the **Macro** level of sustainable software design.

## Table of Contents

1. [Hexagonal Architecture (Ports and Adapters)](#hexagonal-architecture-ports-and-adapters)
2. [Use Case and Adapter Collaboration](#use-case-and-adapter-collaboration)
3. [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
4. [Mapping Strategy](#mapping-strategy)
5. [CQRS and Query Service](#cqrs-and-query-service)
6. [Testing in Clean Architecture](#testing-in-clean-architecture)

---

## Hexagonal Architecture (Ports and Adapters)

Application communicates with the outside world only through "Ports". Technical details (Web, DB) are isolated as "Adapters".

```
    Driving Side (Input)                              Driven Side (Output)
    ─────────────────────                             ─────────────────────

    ┌─────────────┐       ┌─────────────────┐         ┌─────────────────┐       ┌──────────────┐
    │             │       │                 │         │                 │       │              │
    │    Web      │──────►│   Input Port    │         │   Output Port   │◄──────│  Persistence │
    │   Adapter   │       │   (Interface)   │         │   (Interface)   │       │    Adapter   │
    │             │       │                 │         │                 │       │              │
    └─────────────┘       └────────┬────────┘         └────────┬────────┘       └──────────────┘
                                   │                           │
                                   ▼                           ▲
                          ┌────────┴───────────────────────────┴────────┐
                          │                                             │
                          │          ┌───────────────────┐              │
                          │          │  Domain Entities  │              │
                          │          └───────────────────┘              │
                          │                                             │
                          │          ┌───────────────────┐              │
                          │          │    Use Cases      │              │
                          │          └───────────────────┘              │
                          │                                             │
                          │            Core / Business Logic            │
                          └─────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Role | Example |
|---------|------|---------|
| **Input Port** | Interface for receiving requests | `CreateOrderUseCase` interface |
| **Output Port** | Interface for external dependencies | `OrderRepository` interface |
| **Driving Adapter** | Implements input handling | REST Controller, GraphQL Resolver |
| **Driven Adapter** | Implements output port | PostgreSQL Repository, S3 Storage |

### Benefits

- Core business logic is isolated and testable
- Easy to swap adapters (change DB, add new API)
- Framework-agnostic business rules

---

## Use Case and Adapter Collaboration

The flow of control and direction of dependencies.

```
┌──────────────────┐     ┌──────────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│                  │     │                      │     │                    │     │                  │
│   Web Adapter    │────►│    Input Port        │     │    Output Port     │◄────│   Persistence    │
│   (Controller)   │     │  (Use Case Interface)│     │    (Interface)     │     │     Adapter      │
│                  │     │                      │     │                    │     │                  │
└──────────────────┘     └──────────┬───────────┘     └─────────┬──────────┘     └──────────────────┘
                                    │                           │
                                    │    implements             │    implements
                                    │                           │
                                    ▼                           ▲
                         ┌──────────┴───────────────────────────┴───────────┐
                         │                                                  │
                         │             Use Case Service                     │
                         │            (Domain Logic)                        │
                         │                                                  │
                         └──────────────────────────────────────────────────┘

                         ──────────────────────────────────────────────────────►
                                        Flow of Control

                         ◄──────────────────────────────────────────────────────
                                        Dependency Direction
```

### Key Insight

- **Flow of Control**: Left to right (Controller → Use Case → Repository)
- **Dependency Direction**: Inward (Adapters depend on Core, not vice versa)
- Business logic defines interfaces; adapters implement them

---

## Dependency Inversion Principle (DIP)

By depending on abstractions (interfaces), source code dependency direction can be opposite to control flow.

### Traditional (Problematic)

```
┌─────────────────┐
│  Business Logic │
│                 │
└────────┬────────┘
         │ depends on
         ▼
┌─────────────────┐
│ Database Driver │
│                 │
└─────────────────┘

High-level depends on low-level (BAD)
```

### Inverted (Clean)

```
┌─────────────────┐
│  Business Logic │──────────┐
│                 │          │
└─────────────────┘          │
                             │ depends on
         ┌───────────────────┘
         ▼
┌─────────────────┐
│   <Interface>   │
│   Repository    │
│   + save()      │
│   + findById()  │
└────────┬────────┘
         ▲
         │ implements
         │
┌────────┴────────┐
│ Database Adapter│
│                 │
└─────────────────┘

Dependency      │ Both depend on abstraction (GOOD)
Direction       │
       ▲        ▼
       │
       └── Control Flow
```

### Implementation Pattern

```typescript
// modules/order/domain/repositories/repository.ts (Interface in DOMAIN layer)
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// modules/order/use-cases/create/use-case.ts (Use Case depends on domain interface)
import { OrderRepository } from '../../domain/repositories/repository';

class CreateOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(input: CreateOrderInput) {
    const order = Order.create(input);
    await this.orderRepository.save(order);
    return order;
  }
}

// modules/order/adapters/output/repositories/postgres.ts (Adapter implements interface)
import { OrderRepository } from '../../../domain/repositories/repository';

class PostgresOrderRepository implements OrderRepository {
  async findById(id: OrderId) { /* DB logic */ }
  async save(order: Order) { /* DB logic */ }
}
```

**CRITICAL**: Use Case imports the interface from `modules/order/domain/repositories`, NOT from infrastructure. This ensures dependency points inward.

---

## Mapping Strategy

Separating domain entities from persistence and web models to prevent domain pollution.

### Two-Way Mapping

```
┌─────────────┐          ┌─────────────┐          ┌─────────────────┐
│             │  Mapper  │             │  Mapper  │                 │
│  Web Model  │◄────────►│   Domain    │◄────────►│   Persistence   │
│   (DTO)     │          │   Model     │          │     Model       │
│             │          │             │          │                 │
└─────────────┘          └─────────────┘          └─────────────────┘
```

### Benefits

- Domain model evolves freely without database constraints
- Clean separation of concerns
- Different models optimized for their context

### Trade-offs

- More boilerplate code (mapping logic)
- Cost of maintaining domain purity

### Implementation Pattern

```typescript
// Domain Model (pure business logic)
class Post {
  constructor(
    readonly id: PostId,
    readonly title: string,
    readonly publishedAt: Date | null
  ) {}
}

// Mapper Pattern
class PostMapper {
  static toDomain(record: PostRecord) { /* Transform DB → Domain */ }
  static toPersistence(post: Post) { /* Transform Domain → DB */ }
  static toResponse(post: Post) { /* Transform Domain → API */ }
}
```

---

## CQRS and Query Service

Separating read and write concerns for cleaner architecture.

### The Problem with Repository Methods

```typescript
// Repository becomes bloated with query methods
interface PostRepository {
  // Write operations (Command)
  save(post: Post): Promise<void>;
  delete(id: PostId): Promise<void>;

  // Read operations (Query) - these don't belong here!
  findById(id: PostId): Promise<Post | null>;
  findPublished(): Promise<Post[]>;
  findByCategory(category: Category): Promise<Post[]>;
  findByAuthor(authorId: string): Promise<Post[]>;
  findPublishedWithPagination(page: number, limit: number): Promise<PaginatedPosts>;
  searchByKeyword(keyword: string): Promise<Post[]>;
  getStatsByCategory(): Promise<CategoryStats[]>;
  // ... more query methods
}
```

### CQRS Pattern (Simplified)

**Command Query Responsibility Segregation**: Separate read models from write models.

```
┌────────────────────────────────────────────────────────────────┐
│                          Use Cases                             │
├───────────────────────────────┬────────────────────────────────┤
│          Commands             │            Queries             │
│   (Create, Update, Delete)    │      (Read, Search, List)      │
├───────────────────────────────┼────────────────────────────────┤
│                               │                                │
│   ┌─────────────────────┐     │     ┌─────────────────────┐    │
│   │   Repository        │     │     │   Query Service     │    │
│   │   (Write Model)     │     │     │   (Read Model)      │    │
│   └──────────┬──────────┘     │     └──────────┬──────────┘    │
│              │                │                │               │
│              ▼                │                ▼               │
│   ┌─────────────────────┐     │     ┌─────────────────────┐    │
│   │   Domain Entities   │     │     │   View Models/DTOs  │    │
│   │   (Rich Model)      │     │     │   (Optimized)       │    │
│   └─────────────────────┘     │     └─────────────────────┘    │
└───────────────────────────────┴────────────────────────────────┘
```

### Implementation

#### Repository (Commands Only)

```typescript
// modules/post/domain/repositories/postRepository.ts
// Repository focuses on write operations only
export interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: PostId): Promise<Post | null>;  // Needed for loading before update
  delete(id: PostId): Promise<void>;
}
```

#### Query Service (Queries Only)

```typescript
// modules/post/domain/services/postQueryService.ts
// Query Service interface defined in Domain (like Repository)
export interface PostQueryService {
  findPublishedPosts(options: PaginationOptions): Promise<PostSummary[]>;
  findPostsByCategory(category: Category): Promise<PostSummary[]>;
  searchPosts(keyword: string): Promise<PostSummary[]>;
  getPostDetail(id: PostId): Promise<PostDetail | null>;
  getCategoryStats(): Promise<CategoryStats[]>;
}

// View model optimized for reading (not full domain entity)
export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  category: string;
  author: AuthorSummary;
}

export interface PostDetail {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  author: AuthorDetail;
  relatedPosts: PostSummary[];
}
```

#### Query Service Implementation (Adapter)

```typescript
// modules/post/adapters/output/services/prismaPostQueryService.ts
import { PostQueryService, PostSummary } from '../../../domain/services/postQueryService';

export class PrismaPostQueryService implements PostQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async findPublishedPosts(options: PaginationOptions): Promise<PostSummary[]> {
    // Direct query optimized for reading (no domain entity mapping)
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        category: true,
        author: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: options.offset,
      take: options.limit,
    });

    return posts;  // Already in view model shape
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    // Aggregation query - not possible with entity-based repository
    return await this.prisma.post.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { status: 'PUBLISHED' },
    });
  }
}
```

### Use Case Examples

#### Command Use Case (Uses Repository)

```typescript
// modules/post/use-cases/publish-post/useCase.ts
export class PublishPostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: PublishPostInput): Promise<void> {
    const post = await this.postRepository.findById(new PostId(input.postId));
    if (!post) throw new PostNotFoundError(input.postId);

    post.publish();  // Domain logic

    await this.postRepository.save(post);
  }
}
```

#### Query Use Case (Uses Query Service)

```typescript
// modules/post/use-cases/get-published-posts/useCase.ts
export class GetPublishedPostsUseCase {
  constructor(private readonly queryService: PostQueryService) {}

  async execute(input: GetPublishedPostsInput): Promise<PostSummary[]> {
    // No domain entity needed - query directly returns view model
    return await this.queryService.findPublishedPosts({
      offset: (input.page - 1) * input.limit,
      limit: input.limit,
    });
  }
}
```

### When to Use Query Service

| Use Repository | Use Query Service |
|----------------|-------------------|
| Creating/updating entities | Listing/searching data |
| Business logic required | Display-only operations |
| Domain invariants must be checked | Aggregations and statistics |
| Entity state needs to change | Complex joins for views |

### Benefits

1. **Performance**: Query Service can optimize reads without domain model overhead
2. **Clarity**: Repository stays focused on write operations
3. **Flexibility**: Read models can differ from write models
4. **Scalability**: Can scale read and write paths independently (advanced)

### Important Notes

- This is a **simplified CQRS**, not full event-sourced CQRS
- Query Service interface lives in Domain layer (like Repository)
- For simple CRUD apps, a single Repository may be sufficient
- Add Query Service when read operations become complex

---

## Testing in Clean Architecture

The testing pyramid optimized for Clean Architecture.

```
                    ┌───────────────────┐
                    │                   │
                    │   System Tests    │  ← E2E, slow
                    │                   │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              │     Integration Tests         │  ← Test with DB/Web context
              │         (Adapters)            │
              │                               │
              └───────────────┬───────────────┘
                              │
      ┌───────────────────────┴───────────────────────┐
      │                                               │
      │              Unit Tests                       │  ← Fast, no mocking
      │     (Domain Entities & Use Cases - POJOs)     │
      │                                               │
      └───────────────────────────────────────────────┘
```

### Testing Strategy by Layer

| Layer | Test Type | Speed | Mocking Required |
|-------|-----------|-------|------------------|
| Domain Entities | Unit | Fast | None |
| Use Cases | Unit | Fast | Minimal (ports only) |
| Adapters | Integration | Medium | External services |
| Full System | E2E | Slow | None |

### Key Benefit

Domain logic is framework-independent, so:
- Unit tests are extremely fast
- No need for heavy environments to verify business rules
- High test coverage with minimal setup

### Testing Guidelines

**For detailed testing patterns, refer to the K2BG Unit Test Guidelines.**

Key principles for testing Clean Architecture:

```typescript
// Unit Test - Domain Entity (no mocking, fast)
describe('Post', () => {
  it('publishes draft post and sets publish date', () => {
    const post = Post.createDraft('Title', 'Content');

    post.publish();

    expect(post.status).toBe(PostStatus.PUBLISHED);
    expect(post.publishedAt).toBeDefined();
  });
});

// Unit Test - Use Case (mock ports only)
describe('GetPublishedPostsUseCase', () => {
  it('returns published posts from repository', async () => {
    const mockRepository = createMockRepository([
      Post.createPublished('Post 1', 'Content 1')
    ]);
    const sut = new GetPublishedPostsUseCase(mockRepository);

    const result = await sut.execute();

    expect(result).toHaveLength(1);
  });
});

// Integration Test - Adapter (test with real infrastructure)
describe('PrismaPostRepository', () => {
  it('saves and retrieves post correctly', async () => {
    const sut = new PrismaPostRepository(testPrismaClient);
    const post = Post.createDraft('Test', 'Content');

    await sut.save(post);
    const retrieved = await sut.findById(post.id);

    expect(retrieved?.title).toBe('Test');
  });
});
```

---

## Error Handling Strategy

Clear guidelines for error handling across architectural layers.

### Principles by Layer

```
┌────────────────────────────────────────────────────────────────────┐
│                     Controller (Adapter)                           │
│  - Catches ALL exceptions                                          │
│  - Maps to HTTP status codes (404, 500, 503, etc.)                 │
│  - Logs errors for monitoring                                      │
│  - Returns user-friendly error messages                            │
└───────────────────────────┬────────────────────────────────────────┘
                            │ throws
                            ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Use Case (Application)                        │
│  - Throws domain-specific errors for business rule violations      │
│  - Propagates repository errors (does NOT catch/transform)         │
│  - Validates input and throws if invalid                           │
└───────────────────────────┬────────────────────────────────────────┘
                            │ throws
                            ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Repository (Adapter)                            │
│  - Returns `null` for "not found" (expected case)                  │
│  - Throws RepositoryError for infrastructure failures              │
│  - NEVER swallows exceptions as null                               │
│  - Wraps low-level errors with context                             │
└───────────────────────────┬────────────────────────────────────────┘
                            │ throws
                            ▼
┌────────────────────────────────────────────────────────────────────┐
│                       Domain (Entity)                              │
│  - Throws domain errors for invariant violations                   │
│  - Validates state transitions                                     │
│  - Protects business rules                                         │
└────────────────────────────────────────────────────────────────────┘
```

### Error Handling Rules

| Layer | Responsibility | When to Return Null | When to Throw |
|-------|----------------|---------------------|---------------|
| **Domain** | Protect invariants | Never | Business rule violation |
| **Repository** | Data access | Entity not found | Connection failure, query error |
| **Use Case** | Orchestration | Never | Invalid input, business logic failure |
| **Controller** | HTTP mapping | Never | Never (catch all, return HTTP error) |

### Implementation Examples

#### Layer-Specific Implementations

**Domain Layer**: Throw on business rule violations

```typescript
class Post {
  publish() {
    if (this.status === PostStatus.PUBLISHED) {
      throw new PostAlreadyPublishedError(this.id);
    }
    this.status = PostStatus.PUBLISHED;
  }
}
```

**Repository Layer**: Return `null` for "not found", throw `RepositoryError` for failures

```typescript
class NotionPostRepository implements PostRepository {
  async findById(id: PostId) {
    try {
      const result = await this.client.query(/* ... */);
      return result ? this.mapper.toDomain(result) : null;
    } catch (error) {
      if (this.isNotFoundError(error)) return null;
      throw new RepositoryError(`Failed to find post: ${id}`, error);
    }
  }
}
```

**Use Case Layer**: Validate input, orchestrate logic, propagate errors

```typescript
class PublishPostUseCase {
  async execute(input: PublishPostInput) {
    if (!input.postId?.trim()) throw new InvalidInputError('Post ID required');

    const post = await this.postRepository.findById(new PostId(input.postId));
    if (!post) throw new PostNotFoundError(postId);

    post.publish(); // May throw domain errors
    await this.postRepository.save(post); // May throw RepositoryError
  }
}
```

**Controller Layer**: Catch all errors and map to HTTP responses

```typescript
class PostController {
  async handlePublishPost(req, res) {
    try {
      await this.publishPostUseCase.execute({ postId: req.body.postId });
      res.status(200).json({ success: true });
    } catch (error) {
      // Check specific errors BEFORE generic ones
      if (error instanceof InvalidInputError) return res.status(400).json({ error: error.message });
      if (error instanceof PostNotFoundError) return res.status(404).json({ error: 'Not found' });
      if (error instanceof RepositoryError) return res.status(503).json({ error: 'Service unavailable' });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### Summary: Error Flow

```
┌─────────────────┐
│   Controller    │  Catches: Everything
│                 │  Returns: HTTP status codes
└────────┬────────┘
         │
         ▼ throws
┌─────────────────┐
│    Use Case     │  Throws: InvalidInputError, PostNotFoundError
│                 │  Propagates: RepositoryError, Domain errors
└────────┬────────┘
         │
         ├─────────► Domain logic throws: PostAlreadyPublishedError
         │
         └─────────► Repository throws: RepositoryError
                     Repository returns: null (only for "not found")
```

### Critical Rules

1. **Error Type Separation**: Use Case errors (e.g., `PostNotFoundError`) must NOT extend `RepositoryError`
   - Prevents Controller from mismapping 404 → 503

2. **Error Checking Order**: In Controller, check specific errors BEFORE generic ones
   ```typescript
   // CORRECT: Application errors → Infrastructure errors → Unknown errors
   if (error instanceof PostNotFoundError) return 404;
   if (error instanceof RepositoryError) return 503;
   return 500;
   ```

3. **Validation Points**: Validate data at entry boundaries (Mapper, Use Case, Controller)

4. **Preserve Context**: Wrap low-level errors with `cause` property for debugging

5. **Don't Swallow Exceptions**: Only return `null` for genuine "not found" cases

---

## Summary: The Complete Picture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Frameworks & Drivers                                 │
│    ┌──────────────┐                                    ┌──────────────────┐ │
│    │ Web Adapter  │                                    │  DB Adapter      │ │
│    │ (Controller) │                                    │  (Repository)    │ │
│    └──────┬───────┘                                    └────────┬─────────┘ │
│           │                                                     │           │
│  ┌────────┼─────────────────────────────────────────────────────┼────────┐  │
│  │        │               Interface Adapters                    │        │  │
│  │        │      ┌─────────────────────────────────────┐        │        │  │
│  │        │      │        Input/Output Ports           │        │        │  │
│  │        │      │       (Interfaces)                  │        │        │  │
│  │        │      └─────────────────┬───────────────────┘        │        │  │
│  │        │                        │                            │        │  │
│  │  ┌─────┼────────────────────────┼────────────────────────────┼─────┐  │  │
│  │  │     │                        │                            │     │  │  │
│  │  │     │     ┌──────────────────▼──────────────────┐         │     │  │  │
│  │  │     │     │            Use Cases                │         │     │  │  │
│  │  │     │     │     (Application Business Rules)    │         │     │  │  │
│  │  │     │     └──────────────────┬──────────────────┘         │     │  │  │
│  │  │     │                        │                            │     │  │  │
│  │  │     │     ┌──────────────────▼──────────────────┐         │     │  │  │
│  │  │     │     │            Entities                 │         │     │  │  │
│  │  │     │     │    (Enterprise Business Rules)      │         │     │  │  │
│  │  │     │     └─────────────────────────────────────┘         │     │  │  │
│  │  │     │                                                     │     │  │  │
│  │  └─────┼─────────────────────────────────────────────────────┼─────┘  │  │
│  │        │                                                     │        │  │
│  └────────┼─────────────────────────────────────────────────────┼────────┘  │
│           │                                                     │           │
└───────────┼─────────────────────────────────────────────────────┼───────────┘
            │                                                     │
            └─────────────────────────────────────────────────────┘
                              Dependencies point INWARD
```

> "Quality and speed are not trade-offs. The only way to maintain long-term speed is through high-quality design."

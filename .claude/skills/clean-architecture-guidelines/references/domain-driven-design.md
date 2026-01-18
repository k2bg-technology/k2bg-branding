# Domain-Driven Design (DDD) Tactical Patterns

Isolating the problem domain. This is the **Meso** level of sustainable software design.

## Table of Contents

1. [Domain Isolation](#domain-isolation)
2. [Ubiquitous Language](#ubiquitous-language)
3. [Entity](#entity)
4. [Value Object](#value-object)
5. [Aggregate](#aggregate)
6. [Domain Service](#domain-service)
7. [Domain Event](#domain-event)
8. [Repository Pattern](#repository-pattern)
9. [Anemic Domain Model Anti-pattern](#anemic-domain-model-anti-pattern)

---

## Domain Isolation

The core concept of DDD: separate business logic from infrastructure concerns.

```
┌─────────────────────────────────────┐
│     Application / Use Case          │  <- Orchestrates domain
├─────────────────────────────────────┤
│         Domain Layer                │  <- Business logic (PURE)
│    (Business Rules & Logic)         │
├─────────────────────────────────────┤
│      Infrastructure Layer           │  <- Database, UI, External APIs
│      (Database, Web, UI)            │
└─────────────────────────────────────┘
           ↑ Dependencies point UP
```

### Key Principle

The Domain layer:
- Contains business rules and logic
- Has NO dependencies on infrastructure
- Is framework-agnostic (no database, HTTP, etc.)
- Can be tested without external dependencies

---

## Ubiquitous Language

A shared language between domain experts (business) and developers.

```
┌─────────────────┐     ┌─────────────────┐
│    Business     │     │   Developers    │
│    Experts      │     │                 │
│                 │     │                 │
│  ┌───────────┐  │     │  ┌───────────┐  │
│  │           │  │     │  │           │  │
│  │   Uses    │◄─┼─────┼──►   Uses    │  │
│  │           │  │     │  │           │  │
│  └───────────┘  │     │  └───────────┘  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
    ┌─────────────────────────────────┐
    │     Ubiquitous Language         │
    │  (Shared vocabulary & concepts) │
    └─────────────────────────────────┘
```

### Guidelines

| Principle | Explanation |
|-----------|-------------|
| Eliminate translation costs | Use same terms in conversation and code |
| Reflect in code | If business says "Routing", class should be `RoutingService`, not `PathFinder` |
| Share models | Use identical terminology in documents, conversations, and code |

### Example

```typescript
// Bad: Technical terms that don't match business language
class DataProcessor {
  executeTransaction(record: Record) { /* ... */ }
}

// Good: Uses business terminology
class OrderFulfillment {
  processOrder(order: Order) { /* ... */ }
  shipOrder(order: Order) { /* ... */ }
  cancelOrder(order: Order, reason: CancellationReason) { /* ... */ }
}
```

---

## Entity

An object defined by a unique identifier (ID). Identity persists even when attributes change.

### Characteristics

- Has a unique identity (ID)
- Identity remains constant throughout lifecycle
- Can change state over time
- Contains business logic related to its behavior

### Examples

- User (identified by UserId)
- Order (identified by OrderId)
- Post (identified by PostId)

### Implementation

```typescript
// Entity with unique ID
class Post {
  constructor(
    private readonly id: PostId,
    private title: string,
    private content: string,
    private status: PostStatus,
    private readonly createdAt: Date
  ) {}

  // Business logic belongs in the Entity
  publish() {
    if (this.status !== PostStatus.DRAFT) {
      throw new InvalidPostStateError('Only drafts can be published');
    }
    this.status = PostStatus.PUBLISHED;
  }

  // Identity comparison
  equals(other: Post) {
    return this.id.equals(other.id);
  }
}
```

---

## Value Object

An object defined by its attribute values. Immutable and has no identity.

### Characteristics

- Defined by attribute values (no ID)
- Immutable - once created, cannot change
- Equality based on value comparison
- Side-effect free operations

### Examples

- Money (amount + currency)
- Email Address
- Date Range
- Color (RGB values)
- PostId, UserId (identifier wrappers)

### Implementation

```typescript
// Value Object - immutable, compared by value
class PostId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new InvalidPostIdError('PostId cannot be empty');
    }
  }

  getValue() {
    return this.value;
  }

  equals(other: PostId) {
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

// Value Object with multiple attributes
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative');
    }
  }

  add(other: Money) {
    if (!this.currency.equals(other.currency)) {
      throw new CurrencyMismatchError();
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other: Money) {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }
}
```

### Entity vs Value Object

| Aspect | Entity | Value Object |
|--------|--------|--------------|
| Identity | Unique ID | No ID |
| Equality | By ID | By value |
| Mutability | Can change | Immutable |
| Example | User, Order | Email, Money |

---

## Aggregate

A cluster of domain objects treated as a single unit for data changes.

### Characteristics

- Maintains data consistency boundaries
- Has a Root Entity (Aggregate Root)
- External access only through the Root
- Transactional consistency within the boundary

### Example

```typescript
// Aggregate Root
class Order {
  private readonly id: OrderId;
  private items: OrderItem[] = [];      // Child entities
  private shippingAddress: Address;     // Value object
  private status: OrderStatus;

  // External access through Aggregate Root
  addItem(product: Product, quantity: number) {
    const existingItem = this.findItemByProduct(product);
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      this.items.push(new OrderItem(product, quantity));
    }
  }

  // Business rule enforced by Aggregate
  removeItem(productId: ProductId) {
    if (this.status !== OrderStatus.DRAFT) {
      throw new OrderModificationError('Cannot modify confirmed order');
    }
    this.items = this.items.filter(item => !item.productId.equals(productId));
  }

  // Return copies to prevent direct manipulation
  getItems() {
    return [...this.items];
  }
}
```

### Aggregate Design Rules

1. Reference other Aggregates by ID only
2. Keep Aggregates small
3. Modify one Aggregate per transaction
4. Use eventual consistency between Aggregates

---

## Domain Service

Business logic that doesn't naturally belong to a single Entity or Value Object.

### When to Use

- Logic spans multiple Entities or Aggregates
- Logic requires external service dependency (via interface)
- Stateless operations that don't fit in any Entity

### Characteristics

- Stateless (no instance variables holding domain state)
- Named using Ubiquitous Language
- Operates on domain objects passed as parameters
- May depend on Repository interfaces (not implementations)

### Example

```typescript
// modules/post/domain/services/slugUniquenessChecker.ts
// Interface defined in Domain layer
export interface SlugUniquenessChecker {
  isUnique(slug: Slug, excludePostId?: PostId): Promise<boolean>;
}

// modules/post/domain/services/postPublishingService.ts
// Domain Service for complex publishing logic
export class PostPublishingService {
  constructor(
    private readonly slugChecker: SlugUniquenessChecker
  ) {}

  async validateForPublishing(post: Post): Promise<void> {
    // Business rule: Published posts must have unique slugs
    const isUnique = await this.slugChecker.isUnique(post.slug, post.id);
    if (!isUnique) {
      throw new DuplicateSlugError(post.slug);
    }

    // Business rule: Must have content
    if (post.content.isEmpty()) {
      throw new EmptyContentError(post.id);
    }
  }
}

// modules/post/adapters/output/services/prismaSlugChecker.ts
// Implementation in Adapter layer
import { SlugUniquenessChecker } from '../../../domain/services/slugUniquenessChecker';

export class PrismaSlugUniquenessChecker implements SlugUniquenessChecker {
  constructor(private readonly prisma: PrismaClient) {}

  async isUnique(slug: Slug, excludePostId?: PostId): Promise<boolean> {
    const existing = await this.prisma.post.findFirst({
      where: {
        slug: slug.getValue(),
        ...(excludePostId && { id: { not: excludePostId.getValue() } }),
      },
    });
    return existing === null;
  }
}
```

### Domain Service vs Application Service (Use Case)

| Aspect | Domain Service | Application Service |
|--------|----------------|---------------------|
| Location | `domain/services/` | `use-cases/` |
| Contains | Pure business logic | Orchestration logic |
| Dependencies | Domain interfaces only | Domain + Infrastructure ports |
| State | Stateless | Stateless |
| Example | `PostPublishingService` | `PublishPostUseCase` |

---

## Domain Event

An immutable record of something significant that happened in the domain.

### Characteristics

- Immutable (all fields readonly)
- Named in past tense (e.g., `PostPublished`, `OrderPlaced`)
- Contains only the data needed to describe what happened
- Includes timestamp of when it occurred

### Use Cases

- Loose coupling between Aggregates
- Audit logging
- Triggering side effects (notifications, analytics)
- Event sourcing (advanced)

### Implementation

```typescript
// modules/post/domain/events/domainEvent.ts
export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventType: string;
}

// modules/post/domain/events/postPublished.ts
export class PostPublishedEvent implements DomainEvent {
  readonly eventType = 'PostPublished';
  readonly occurredAt: Date;

  constructor(
    readonly postId: PostId,
    readonly publishedAt: Date,
    readonly authorId: string
  ) {
    this.occurredAt = new Date();
  }
}

// modules/post/domain/events/postArchived.ts
export class PostArchivedEvent implements DomainEvent {
  readonly eventType = 'PostArchived';
  readonly occurredAt: Date;

  constructor(
    readonly postId: PostId,
    readonly archivedBy: string,
    readonly reason?: string
  ) {
    this.occurredAt = new Date();
  }
}
```

### Entity with Domain Events

```typescript
// modules/post/domain/entities/entity.ts
export class Post {
  private _domainEvents: DomainEvent[] = [];

  publish(): void {
    if (this._status === PostStatus.PUBLISHED) {
      throw new PostAlreadyPublishedError(this._id);
    }

    this._status = PostStatus.PUBLISHED;
    this._publishedAt = new Date();

    // Record the event
    this._domainEvents.push(
      new PostPublishedEvent(this._id, this._publishedAt, this._authorId)
    );
  }

  archive(archivedBy: string, reason?: string): void {
    if (this._status === PostStatus.ARCHIVED) {
      throw new PostAlreadyArchivedError(this._id);
    }

    this._status = PostStatus.ARCHIVED;

    this._domainEvents.push(
      new PostArchivedEvent(this._id, archivedBy, reason)
    );
  }

  // Pull events after save (clear after retrieval)
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
```

### Publishing Events in Use Case

```typescript
// modules/post/use-cases/publish/use-case.ts
export class PublishPostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: PublishPostInput): Promise<void> {
    const post = await this.postRepository.findById(new PostId(input.postId));
    if (!post) throw new PostNotFoundError(input.postId);

    post.publish();

    await this.postRepository.save(post);

    // Publish domain events after successful save
    const events = post.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }
  }
}
```

### Event Publisher Interface

```typescript
// modules/shared/domain/eventPublisher.ts
export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

// infrastructure/events/simpleEventPublisher.ts
export class SimpleEventPublisher implements EventPublisher {
  private handlers: Map<string, ((event: DomainEvent) => Promise<void>)[]> = new Map();

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }
}
```

---

## Repository Pattern

Abstracts data persistence. Domain sees it as an in-memory collection.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Domain Layer                              │
│  ┌──────────────┐         ┌─────────────────────────────────┐   │
│  │   Client     │────────►│   Repository Interface          │   │
│  │   Object     │         │   (add, remove, findById, etc.) │   │
│  └──────────────┘         └──────────────┬──────────────────┘   │
└──────────────────────────────────────────┼──────────────────────┘
                                           │ implements
┌──────────────────────────────────────────┼──────────────────────┐
│                   Infrastructure Layer   │                       │
│                          ┌───────────────▼───────────────────┐   │
│                          │   Repository Implementation       │   │
│                          │   ┌─────────┐    ┌─────────┐      │   │
│                          │   │   DB    │    │   SQL   │      │   │
│                          │   └─────────┘    └─────────┘      │   │
│                          └───────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Benefits

- Domain sees repository as "in-memory collection"
- Hides SQL/ORM details from domain
- Increases testability
- Bridges domain model and persistence technology

### Implementation

```typescript
// modules/post/domain/repositories/repository.ts
// Interface MUST be defined in DOMAIN layer
export interface PostRepository {
  findById(id: PostId): Promise<Post | null>;
  findPublished(): Promise<Post[]>;
  save(post: Post): Promise<void>;
  delete(id: PostId): Promise<void>;
}

// modules/post/adapters/output/repositories/prisma.ts
// Implementation in ADAPTER layer
import { PostRepository } from '../../../domain/repositories/repository';
import { PostMapper } from '../mappers/mapper';

class PrismaPostRepository implements PostRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: PostId) {
    const record = await this.prisma.post.findUnique({
      where: { id: id.getValue() }
    });
    return record ? PostMapper.toDomain(record) : null;
  }

  async save(post: Post) {
    const data = PostMapper.toPersistence(post);
    await this.prisma.post.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}

// modules/post/use-cases/get-published/use-case.ts
// Use Case imports interface from DOMAIN, not infrastructure
import { PostRepository } from '../../domain/repositories/repository';

class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {} // Interface from domain

  async execute() {
    return await this.postRepository.findPublished();
  }
}
```

**CRITICAL**: The Repository interface lives in `modules/post/domain/repositories`, and Use Cases import from there. Adapters implement the interface.

---

## Anemic Domain Model Anti-pattern

### The Problem

Entities become mere "data containers" with only getters and setters. All logic lives in services.

```typescript
// BAD: Anemic Domain Model
class User {
  id: string;
  email: string;
  password: string;
  isActive: boolean;

  // Only getters/setters, no business logic
}

class UserService {
  // All logic in service
  activateUser(user: User) {
    user.isActive = true;
    this.repository.save(user);
    this.emailService.sendActivationEmail(user);
  }

  deactivateUser(user: User) {
    user.isActive = false;
    this.repository.save(user);
  }
}
```

### The Solution

Encapsulate logic and data together in the Entity.

```typescript
// GOOD: Rich Domain Model
class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private passwordHash: PasswordHash,
    private status: UserStatus
  ) {}

  // Business logic IN the entity
  activate(): void {
    if (this.status === UserStatus.ACTIVE) {
      throw new UserAlreadyActiveError(this.id);
    }
    this.status = UserStatus.ACTIVE;
  }

  deactivate(reason: DeactivationReason) {
    if (this.status === UserStatus.INACTIVE) {
      throw new UserAlreadyInactiveError(this.id);
    }
    this.status = UserStatus.INACTIVE;
  }

  changeEmail(newEmail: Email) {
    if (this.email.equals(newEmail)) {
      return; // No change needed
    }
    this.email = newEmail;
  }

  // Factory method with validation
  static create(email: Email, password: Password) {
    return new User(
      UserId.generate(),
      email,
      password.hash(),
      UserStatus.PENDING
    );
  }
}

// Service only orchestrates
class UserActivationService {
  constructor(
    private repository: UserRepository,
    private eventPublisher: EventPublisher
  ) {}

  async activateUser(userId: UserId) {
    const user = await this.repository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    user.activate(); // Domain logic in entity

    await this.repository.save(user);
    await this.eventPublisher.publish(new UserActivatedEvent(userId));
  }
}
```

### Summary

| Anemic Model | Rich Model |
|--------------|------------|
| Entity = data only | Entity = data + behavior |
| Logic in services | Logic in domain objects |
| Procedural style | Object-oriented style |
| Hard to enforce invariants | Invariants enforced internally |

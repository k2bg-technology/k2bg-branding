---
name: clean-architecture-guidelines
description: |
  Comprehensive Clean Architecture, DDD, and Clean Code implementation guidelines for sustainable software design.
  Provides design principles, patterns, and TypeScript code examples with vertical slicing module structure.

  Use when:
  (1) Adopting Clean Architecture in a new or existing project
  (2) Implementing Domain-Driven Design (DDD) tactical patterns
  (3) Designing Entities, Value Objects, and Aggregates
  (4) Implementing Use Case layer or Repository layer
  (5) Organizing modules with vertical slicing approach
  (6) Structuring shared infrastructure vs. module-specific code
  (7) Organizing and refactoring dependency directions
  (8) Applying Ports and Adapters (Hexagonal) pattern
  (9) Deciding on mapping strategies between layers
  (10) Writing testable, maintainable business logic
---

# Clean Architecture Guidelines

A practical guide for sustainable software design based on Clean Code, Domain-Driven Design, and Clean Architecture principles.

## Overview

This skill provides design principles at three levels:

| Level | Concept | Focus |
|-------|---------|-------|
| Micro | Clean Code | Writing readable, maintainable code |
| Meso | Domain-Driven Design | Isolating business logic |
| Macro | Clean Architecture | Controlling dependency direction |

> "Code is read far more often than it is written."

## The Dependency Rule

The fundamental principle of Clean Architecture:

```
Source code dependencies must point inward toward higher-level policies.
```

```
┌─────────────────────────────────────────────────┐
│     Frameworks & Drivers (Web, DB, UI)          │  <- Outermost
│  ┌─────────────────────────────────────────┐    │
│  │    Interface Adapters                   │    │
│  │    (Controllers, Gateways, Presenters)  │    │
│  │  ┌─────────────────────────────────┐    │    │
│  │  │       Use Cases                 │    │    │
│  │  │  ┌─────────────────────────┐    │    │    │
│  │  │  │       Entities          │    │    │    │  <- Innermost
│  │  │  └─────────────────────────┘    │    │    │
│  │  └─────────────────────────────────┘    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
              ↑ Dependencies point inward
```

**Key rule**: Changes in outer circles (details) must NOT affect inner circles (business rules).

## Directory Structure

Recommended project structure for Clean Architecture with vertical slicing:

```
src/
├── infrastructure/              # Shared technical foundation (all modules)
│   ├── notion/
│   │   ├── client.ts           # Notion API client
│   │   └── types.ts            # Notion type definitions
│   ├── prisma/
│   │   ├── client.ts           # Prisma client
│   │   └── schema.prisma
│   ├── logging/
│   │   └── logger.ts           # Logger implementation
│   └── config/
│       └── env.ts              # Environment variable management
│
└── modules/                     # Business modules (vertical slicing)
    └── post/                    # Post module
        ├── domain/              # Enterprise Business Rules (innermost)
        │   ├── entities/
        │   │   └── entity.ts   # Post entity
        │   ├── value-objects/
        │   │   ├── id.ts       # PostId value object
        │   │   └── category.ts
        │   └── repositories/    # Repository INTERFACES (Output Ports)
        │       └── repository.ts # PostRepository
        │
        ├── use-cases/           # Application Business Rules
        │   ├── get-published/
        │   │   ├── getPublished.ts
        │   │   ├── port.ts      # Input Port (optional)
        │   │   └── queryService.ts # Output Port for use-case-specific queries
        │   └── publish/
        │       ├── publish.ts
        │       └── port.ts
        │
        └── adapters/
            ├── input/           # Driving Adapters (Controllers, CLI, etc.)
            │   └── controllers/
            │   │   └── controller.ts
            │   └── presenters/
            │       └── presenter.ts
            │
            └── output/          # Driven Adapters (Infrastructure integration layer)
                ├── repositories/
                │   └── notion.ts # Implements domain/repositories/repository.ts
                ├── query-services/
                │   └── notionPublished.ts # Implements use-cases/.../query-service.ts
                └── mappers/
                    └── mapper.ts
```

**Key Points:**
- **Vertical Slicing**: Each business module (e.g., `post/`, `user/`, `comment/`) contains its own domain, use-cases, and adapters
  - ⚠️ **Naming Convention**: Avoid repeating module name in file names (e.g., `post/domain/entities/entity.ts` not `post.ts`)
- **Shared Infrastructure**: Common technical foundations (Notion client, Prisma client, logger, config) live in `infrastructure/`
  - ⚠️ **Dependency Rule**: Domain and Use Cases must NEVER import from `infrastructure/`
  - ✅ Only `adapters/output/` can import from `infrastructure/`
- Repository **interfaces** live in `modules/{module}/domain/repositories` (Output Ports)
  - **Constraint**: Limit to basic CRUD + aggregate operations only
  - Methods should use domain terminology, not UI/feature-specific terms
  - Example: `save()`, `findById()`, `remove()` ✅
  - Example: `findPublishedPostsForTopPage()`, `getAdminDashboardPosts()` ❌
- **Use Case-specific queries** should use Query Services in `use-cases/{use-case}/query-service.ts`
  - Complex searches, aggregations, pagination logic
  - Feature-specific data retrieval (e.g., for specific pages)
  - Example: `PublishedPostsQueryService`, `PostSearchQueryService`
- Repository **implementations** live in `modules/{module}/adapters/output/repositories`
  - These implementations use `infrastructure/` clients (Notion, Prisma, etc.)
- Use Cases depend only on Domain (entities + repository interfaces)
- Adapters depend on both Domain and Use Cases, never the reverse
- Modules should be independent; cross-module dependencies require careful design

**Common Mistakes to Avoid:**
- ❌ Placing repository interface in infrastructure layer
- ❌ Use Case importing from `adapters/` or `infrastructure/`
- ❌ Domain or Use Case directly importing from `infrastructure/`
- ❌ Direct inter-module dependencies (e.g., `modules/post/` importing from `modules/user/`)
- ❌ Mixing domain ID with infrastructure ID (e.g., Notion page_id)
- ❌ Swallowing all exceptions as `null` in repositories
- ❌ Repeating module name in file names (e.g., `post/domain/entities/post.ts`)
- ❌ **Repository polluted with UI/feature concerns**
  ```typescript
  // ❌ BAD: Use case-specific methods in domain repository
  interface PostRepository {
    findPublishedPostsForTopPage(limit: number): Promise<Post[]>
    findPostsForAdminDashboard(): Promise<Post[]>
    findPostsWithStatsByDateRange(from: Date, to: Date): Promise<PostStats[]>
  }
  ```
- ✅ Repository interface in `modules/{module}/domain/repositories/` with basic operations only
- ✅ Use Case imports only from its own module's `domain/`
- ✅ Only `adapters/output/` imports from `infrastructure/`
- ✅ Inter-module communication through well-defined ports or shared kernel
- ✅ Separate domain ID from infrastructure ID
- ✅ Throw specific errors, only return `null` for "not found"
- ✅ Use generic file names within module directories
- ✅ **Use Query Services for complex/specific queries**
  ```typescript
  // ✅ GOOD: Basic operations in domain repository
  // modules/post/domain/repositories/repository.ts
  interface PostRepository {
    save(post: Post): Promise<void>
    findById(id: PostId): Promise<Post | null>
    remove(id: PostId): Promise<void>
  }

  // ✅ GOOD: Use case-specific queries in separate port
  // modules/post/use-cases/get-published/query-service.ts
  interface PublishedPostsQueryService {
    findPublished(params: PaginationParams): Promise<PostSummary[]>
  }
  ```

## Quick Reference

### Implementation Checklist

- [ ] Entity has unique ID and contains business logic
- [ ] Value Object is immutable and compared by value equality
- [ ] Use Case focuses on single business operation
- [ ] Repository interface defined in `modules/{module}/domain/repositories`
- [ ] Repository interface contains only basic CRUD operations
- [ ] Complex queries use dedicated Query Services in use-cases
- [ ] External dependencies (DB, API) isolated in `infrastructure/`
- [ ] Only `adapters/output/` imports from `infrastructure/`
- [ ] Dependencies point inward (toward domain)
- [ ] No framework dependencies in domain/use-case layers
- [ ] Module names not repeated in file names (e.g., use `entity.ts` not `post.ts` in `post/` module)
- [ ] Modules are independent with minimal cross-module dependencies

### Anti-patterns to Avoid

| Anti-pattern | Problem | Solution |
|-------------|---------|----------|
| Anemic Domain Model | Entity has only getters/setters | Move business logic into Entity |
| God Class | Single class with too many responsibilities | Split by Single Responsibility |
| Layer Violation | Use Case directly references DB | Access through Repository |
| Bidirectional Dependency | Circular references | Invert with interfaces |

## Detailed References

Refer to these files based on your needs:

- **Clean Code Principles**: [references/clean-code.md](references/clean-code.md)
  - Naming conventions, function design, cohesion

- **DDD Tactical Patterns**: [references/domain-driven-design.md](references/domain-driven-design.md)
  - Entity, Value Object, Aggregate, Repository

- **Architecture Patterns**: [references/clean-architecture.md](references/clean-architecture.md)
  - Ports and Adapters, DIP, mapping strategies, testing

- **TypeScript Implementation Examples**: [references/implementation-examples.md](references/implementation-examples.md)
  - Concrete code samples for each pattern

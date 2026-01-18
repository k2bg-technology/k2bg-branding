# Clean Code Principles

The art of making code intentions clear. This is the **Micro** level of sustainable software design.

## Table of Contents

1. [Meaningful Names](#meaningful-names)
2. [Functions Do One Thing](#functions-do-one-thing)
3. [Guard Clauses (Early Return)](#guard-clauses-early-return)
4. [Boy Scout Rule](#boy-scout-rule)
5. [Class Structure and Cohesion](#class-structure-and-cohesion)
6. [Entropy and Broken Windows](#entropy-and-broken-windows)
7. [TypeScript Best Practices](#typescript-best-practices)

---

## Meaningful Names

Variable and function names must completely reveal intent. If a name requires a comment, it is not a good name.

### Guidelines

| Principle | Bad | Good |
|-----------|-----|------|
| Reveal intent | `d` | `elapsedTimeInDays` |
| Avoid disinformation | `accountList` (if not a List) | `accounts` or `accountGroup` |
| Make distinctions | `data`, `info`, `object` | `productData`, `accountInfo` |
| Use pronounceable names | `genymdhms` | `generationTimestamp` |
| Use searchable names | `7` | `MAX_CLASSES_PER_STUDENT = 7` |

### Examples

```typescript
// Bad: What does 'd' represent?
const d = new Date();
const flag = true;

// Good: Intent is clear
const registrationDate = new Date();
const isUserAuthenticated = true;
```

```typescript
// Bad: Generic, unclear names
function process(data) {
  // ...
}

// Good: Specific, intention-revealing
function calculateMonthlyRevenue(salesRecords: SalesRecord[]) {
  // ...
}
```

---

## Functions Do One Thing

Apply Single Responsibility Principle (SRP) at the function level. The shorter the function, the clearer its intent.

### Guidelines

- A function should do one thing, do it well, and do it only
- Functions should be small (ideally < 20 lines)
- One level of abstraction per function
- Maximum 3 arguments (prefer fewer)

### Examples

```typescript
// Bad: Function does multiple things
function processUser(user: User) {
  // Validate
  if (!user.email || !user.name) {
    throw new Error('Invalid user');
  }

  // Format
  user.email = user.email.toLowerCase();
  user.name = user.name.trim();

  // Save
  database.save(user);

  // Notify
  emailService.send(user.email, 'Welcome!');
}

// Good: Each function does one thing
function validateUser(user: User) {
  if (!user.email || !user.name) {
    throw new InvalidUserError(user);
  }
}

function normalizeUser(user: User) {
  return {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim(),
  };
}

function registerUser(user: User) {
  validateUser(user);
  const normalizedUser = normalizeUser(user);
  userRepository.save(normalizedUser);
  notificationService.sendWelcomeEmail(normalizedUser);
}
```

### Command-Query Separation

Functions should either:
- **Do something** (command) - Change state, return nothing
- **Answer something** (query) - Return data, change nothing

```typescript
// Bad: Does both
function setAndGetUser(id: string, name: string) {
  user.name = name;      // Command
  return user;           // Query
}

// Good: Separated
function updateUserName(id: string, name: string) {
  user.name = name;
}

function getUser(id: string) {
  return userRepository.findById(id);
}
```

---

## Guard Clauses (Early Return)

Handle exceptional cases first to reduce nesting and improve readability.

### The Problem: Deep Nesting

```typescript
// Bad: Deep nesting makes the happy path hard to find
function processOrder(order: Order | null) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        if (order.customer.isActive) {
          // Finally, the actual business logic
          order.process();
          return { success: true };
        } else {
          return { success: false, error: 'Inactive customer' };
        }
      } else {
        return { success: false, error: 'Order not pending' };
      }
    } else {
      return { success: false, error: 'Empty order' };
    }
  } else {
    return { success: false, error: 'No order' };
  }
}
```

### The Solution: Guard Clauses

```typescript
// Good: Guard clauses handle edge cases first
function processOrder(order: Order | null) {
  if (!order) {
    return { success: false, error: 'No order' };
  }

  if (order.items.length === 0) {
    return { success: false, error: 'Empty order' };
  }

  if (order.status !== 'pending') {
    return { success: false, error: 'Order not pending' };
  }

  if (!order.customer.isActive) {
    return { success: false, error: 'Inactive customer' };
  }

  // Happy path is clear and at the main indentation level
  order.process();
  return { success: true };
}
```

### Guidelines

| Principle | Description |
|-----------|-------------|
| Check preconditions first | Validate inputs at the start |
| Return early for invalid cases | Don't wait until the end |
| Keep happy path unindented | Main logic should be at base level |
| Use positive conditions when possible | `if (!valid) return` is clearer than nested `if (valid) { ... }` |

### With Exceptions

```typescript
// Using exceptions for guard clauses
function publishPost(post: Post): void {
  if (!post) {
    throw new InvalidArgumentError('Post is required');
  }

  if (post.status === PostStatus.PUBLISHED) {
    throw new PostAlreadyPublishedError(post.id);
  }

  if (post.content.isEmpty()) {
    throw new EmptyContentError(post.id);
  }

  // Clear happy path
  post.status = PostStatus.PUBLISHED;
  post.publishedAt = new Date();
}
```

---

## Boy Scout Rule

> "Leave the campground cleaner than you found it."

Continuously improve the codebase with small, incremental changes.

### Application

When you touch code:
1. Fix any obvious issues you see
2. Improve variable names
3. Extract small methods
4. Remove dead code
5. Add missing type annotations

### Important Constraints

- Make improvements that are **small and safe**
- Don't refactor unrelated code in the same commit
- Ensure tests still pass after changes
- Keep the scope of changes manageable

---

## Class Structure and Cohesion

### God Class vs Cohesive Classes

```
┌────────────────────────┐      ┌─────────────┐
│      God Class         │      │   Class A   │
│  ┌───┬───┬───┬───┐     │      │  ┌───────┐  │
│  │   │   │   │   │     │      │  │  data │  │
│  └─┬─┴─┬─┴─┬─┴─┬─┘     │      │  └───┬───┘  │
│    │   │   │   │       │  =>  │      │      │
│  ┌─┴───┴───┴───┴─┐     │      │  ┌───┴───┐  │
│  │ many methods  │     │      │  │methods│  │
│  └───────────────┘     │      │  └───────┘  │
│  Low cohesion,         │      └─────────────┘
│  many instance vars,   │      High cohesion,
│  hard to understand    │      single responsibility
└────────────────────────┘
```

### Cohesion Guidelines

- Class should have few instance variables
- Each method should operate on those variables
- The more variables a method uses, the more cohesive it is to the class

### Example

```typescript
// Bad: Low cohesion - class does too many things
class UserManager {
  private db: Database;
  private emailService: EmailService;
  private logger: Logger;
  private cache: Cache;

  createUser() { /* ... */ }
  deleteUser() { /* ... */ }
  sendEmail() { /* ... */ }
  logActivity() { /* ... */ }
  cacheUser() { /* ... */ }
  validateEmail() { /* ... */ }
  generateReport() { /* ... */ }
}

// Good: High cohesion - each class has single responsibility
class UserRepository {
  constructor(private db: Database) {}

  save(user: User): void { /* ... */ }
  findById(id: UserId): User | null { /* ... */ }
  delete(id: UserId): void { /* ... */ }
}

class UserNotificationService {
  constructor(private emailService: EmailService) {}

  sendWelcomeEmail(user: User): void { /* ... */ }
  sendPasswordReset(user: User): void { /* ... */ }
}
```

---

## Entropy and Broken Windows

### Why Projects Fail

- Technical debt
- Tight coupling
- Code rot

### Broken Windows Theory

Bad code encourages the next developer to write more bad code. Small disorder leads to total system collapse.

### Prevention

1. **Never leave "broken windows"** - Fix bad code when you see it
2. **Establish coding standards** - Consistent style across the team
3. **Regular refactoring** - Scheduled improvement time
4. **Code reviews** - Catch issues early
5. **Automated quality checks** - Linting, formatting, type checking

### Warning Signs

| Symptom | Risk | Action |
|---------|------|--------|
| `// TODO: fix later` | Tech debt accumulation | Fix now or create tracked issue |
| `any` type overuse | Type safety loss | Add proper types |
| Copy-paste code | Duplication | Extract to shared function |
| Deep nesting | Complexity | Extract methods, early returns |
| Long parameter lists | Coupling | Use parameter objects |

---

## TypeScript Best Practices

TypeScript-specific patterns for safer, more maintainable code.

### Branded Types (Nominal Typing)

Prevent accidental mixing of primitive types that represent different concepts.

```typescript
// Problem: Both are strings, easy to mix up
function getUser(userId: string): User { /* ... */ }
function getPost(postId: string): Post { /* ... */ }

// Oops! No compile error, but wrong at runtime
const post = getPost(userId);  // Should be postId!
```

```typescript
// Solution: Branded types
type PostId = string & { readonly __brand: 'PostId' };
type UserId = string & { readonly __brand: 'UserId' };

function createPostId(value: string): PostId {
  return value as PostId;
}

function createUserId(value: string): UserId {
  return value as UserId;
}

function getUser(userId: UserId): User { /* ... */ }
function getPost(postId: PostId): Post { /* ... */ }

// Compile error! Types are incompatible
const post = getPost(userId);  // ❌ Error: UserId is not assignable to PostId
```

### `as const` for Enums

Type-safe enums without the overhead of TypeScript's `enum` keyword.

```typescript
// Using as const (recommended)
const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

type PostStatus = typeof PostStatus[keyof typeof PostStatus];
// Result: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

// Usage
function publish(post: { status: PostStatus }): void {
  if (post.status === PostStatus.DRAFT) {
    // TypeScript knows status is exactly 'DRAFT' here
  }
}
```

### `readonly` for Immutability

Prevent accidental mutation of class properties and arrays.

```typescript
class Post {
  // Immutable identity fields
  private readonly _id: PostId;
  private readonly _createdAt: Date;

  // Mutable state fields
  private _status: PostStatus;
  private _title: string;

  constructor(id: PostId, title: string) {
    this._id = id;               // Can only be set once
    this._createdAt = new Date();
    this._status = PostStatus.DRAFT;
    this._title = title;
  }
}

// For arrays, use ReadonlyArray
class Tags {
  private readonly values: ReadonlyArray<string>;

  constructor(values: string[]) {
    this.values = Object.freeze([...values]);
  }

  // Cannot accidentally mutate
  // this.values.push('new');  // ❌ Compile error
}
```

### Strict Null Checks

Always enable `strictNullChecks` and handle nullability explicitly.

```typescript
// tsconfig.json: "strictNullChecks": true

// Function clearly indicates it may return null
function findById(id: PostId): Post | null {
  const record = db.find(id);
  return record ? mapToPost(record) : null;
}

// Caller MUST handle null case
const post = findById(postId);

// Compile error if you don't check
// post.title;  // ❌ Error: Object is possibly 'null'

// Correct usage
if (post) {
  console.log(post.title);  // ✅ TypeScript knows post is not null
}

// Or with guard clause
if (!post) {
  throw new PostNotFoundError(postId);
}
console.log(post.title);  // ✅ TypeScript knows post is not null
```

### Discriminated Unions for State

Model states explicitly with discriminated unions.

```typescript
// Bad: Ambiguous state
interface Post {
  status: 'draft' | 'published';
  publishedAt?: Date;  // Optional, unclear when it's set
}

// Good: Discriminated union makes states explicit
type Post =
  | { status: 'draft'; title: string; content: string }
  | { status: 'published'; title: string; content: string; publishedAt: Date }
  | { status: 'archived'; title: string; content: string; archivedAt: Date };

function handlePost(post: Post) {
  switch (post.status) {
    case 'draft':
      // TypeScript knows publishedAt doesn't exist here
      break;
    case 'published':
      // TypeScript knows publishedAt exists here
      console.log(post.publishedAt);
      break;
    case 'archived':
      // TypeScript knows archivedAt exists here
      console.log(post.archivedAt);
      break;
  }
}
```

### Type Predicates for Type Guards

Create reusable type guards with type predicates.

```typescript
// Type predicate function
function isPublishedPost(post: Post): post is PublishedPost {
  return post.status === PostStatus.PUBLISHED;
}

// Usage
const posts: Post[] = await repository.findAll();

// Filter with type safety
const publishedPosts: PublishedPost[] = posts.filter(isPublishedPost);

// Each item is now correctly typed as PublishedPost
publishedPosts.forEach(post => {
  console.log(post.publishedAt);  // ✅ TypeScript knows this exists
});
```

### Summary Table

| Pattern | Purpose | Example |
|---------|---------|---------|
| Branded Types | Prevent mixing similar primitives | `PostId`, `UserId` |
| `as const` | Type-safe enum-like constants | `PostStatus` |
| `readonly` | Prevent mutation | Immutable class fields |
| Strict Null Checks | Explicit nullability | `Post \| null` |
| Discriminated Unions | Model explicit states | Draft vs Published |
| Type Predicates | Reusable type guards | `isPublishedPost()` |

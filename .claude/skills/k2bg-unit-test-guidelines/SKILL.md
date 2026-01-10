---
name: k2bg-unit-test-guidelines
description: Comprehensive unit test coding standards and best practices for K2BG projects using Vitest and Testing Library. Use when writing or reviewing unit tests or component tests to ensure high-quality, maintainable test code that follows behavior-driven testing principles, descriptive test naming with describe/it blocks, and AAA pattern structure.
---

# K2BG Unit Test Guidelines

## Overview

This skill provides comprehensive coding standards for writing high-quality unit tests in K2BG projects. These guidelines emphasize testing behavior over implementation, maintaining test code quality equal to production code, and following established patterns for test structure and organization.

**Testing Stack:**

- **Unit/Integration Tests**: Vitest
- **Component Tests**: Vitest + Testing Library (@testing-library/react)

## General Principles

### Test Behavior, Not Implementation

- Tests must verify "units of behavior" rather than "units of code" (classes or methods)
- Validate observable results (return values, state changes, external calls) through public APIs, not internal implementation details
- Avoid testing private methods or internal state
- **Rationale**: Tests coupled to implementation details hinder refactoring and reduce resistance to change

### Tests as Specification

- Treat test code as "living documentation" that defines how the system should behave
- Behavior not covered by the test suite is considered non-existent
- Write only the minimum code necessary to make a failing test pass (Test-First/TDD recommended)
- Every test should document a specific expected behavior

### Keep Test Code CLEAN

- Test code is as important as production code and requires maintenance
- Apply the same quality principles to tests: high cohesion, loose coupling, encapsulation, assertiveness, non-redundancy
- Refactor test code when it becomes difficult to understand or maintain
- Avoid code duplication in test setup and assertions

## Naming Conventions

### Test Structure and Naming

Use `describe` blocks to group related tests and `it`/`test` blocks with descriptive natural language strings to specify behavior.

**Best Practices:**

- `describe` blocks: Name the subject under test (class, function, component)
- `it`/`test` blocks: Write complete sentences using present tense verbs
- **Consistency**: Use `it` throughout the project (in Vitest, `test` is an alias for `it`, but mixing them reduces searchability)
- **Verb preference**: Prefer present tense verbs (does, returns, throws, displays) over "should"
  - Using "should" is not forbidden, but current tense is more direct and reads better
  - Example: "returns error" (preferred) vs "should return error" (acceptable)
- Make test descriptions specific enough to understand what failed without reading the code
- Use "when" or "with" to provide context about preconditions

**Examples:**

```typescript
// ✅ Good - Descriptive, present tense
describe('PricingService', () => {
  describe('calculateTotal', () => {
    it('returns sum of prices when given valid items', () => {
      // test implementation
    });

    it('throws error when items array is empty', () => {
      // test implementation
    });
  });
});

describe('LoginForm', () => {
  it('displays error message when credentials are invalid', () => {
    // test implementation
  });

  it('calls onSubmit with user data when form is valid', () => {
    // test implementation
  });
});

// ❌ Bad - Vague, abbreviated
describe('PricingService', () => {
  test('calc', () => {
    // What does this test?
  });

  test('test1', () => {
    // Meaningless name
  });
});
```

**Nested `describe` blocks** are useful for organizing tests by method or scenario:

```typescript
describe('OrderService', () => {
  describe('processPayment', () => {
    describe('when balance is sufficient', () => {
      it('completes the transaction', () => {});
      it('sends confirmation email', () => {});
    });

    describe('when balance is insufficient', () => {
      it('returns false', () => {});
      it('logs error message', () => {});
    });
  });
});
```

### Variable Names

- Name the system under test instance variable as `sut` (System Under Test) to clearly distinguish it from dependencies
- Store literal values in named variables that convey intent before using in assertions
- **Avoid** magic numbers or raw strings in assertions

**Examples:**

```typescript
// ✅ Good
const expectedAge = 21;
expect(person.age).toBe(expectedAge);

const minimumPasswordLength = 8;
expect(password.length).toBeGreaterThanOrEqual(minimumPasswordLength);

// ❌ Bad
expect(person.age).toBe(21); // What does 21 represent?
expect(password.length).toBeGreaterThanOrEqual(8); // Why 8?
```

## Test Structure

### AAA Pattern (Arrange, Act, Assert)

All unit tests must follow the three-phase structure with blank lines separating each phase:

1. **Arrange**: Set up the system under test, dependencies, and test data
2. **Act**: Invoke the method being tested
3. **Assert**: Verify the results

**Example:**

```typescript
describe('PricingService', () => {
  describe('calculateDiscount', () => {
    it('applies 20% discount for VIP customers', () => {
      // Arrange
      const sut = new PricingService();
      const customer = new Customer({ type: 'VIP' });
      const originalPrice = 100;

      // Act
      const discountedPrice = sut.calculateDiscount(customer, originalPrice);

      // Assert
      const expectedPrice = 80;
      expect(discountedPrice).toBe(expectedPrice);
    });
  });
});
```

**Guidelines:**

- Visual separation with blank lines is sufficient; phase comments (`// Arrange`, etc.) are optional
- If phase comments are used, they should be consistent across the test suite

### Single Action in Act Phase

**For Unit Tests:**

- The Act phase should ideally be **one line** (a single method invocation)
- Multiple lines may indicate poor API design or testing too large a unit of behavior

**For Component Tests:**

- The Act phase represents **one user intent** (may span multiple lines for user interactions)
- Example: Filling a form and submitting is one intent, even if it requires multiple `userEvent` calls
- Keep the intent focused and atomic

### Avoid Custom Loops - Use Parameterized Tests

- **Never** write custom control flow (`if`, `while`, `switch`, `for`) in test bodies
- **Instead**, use Vitest's `it.each()` or `describe.each()` for parameterized tests
- Cyclomatic complexity of individual test bodies should be 1
- **Exception**: Minimal data transformation (e.g., `.map()` for test data generation) is acceptable when it improves clarity

**Examples:**

```typescript
// ❌ Bad - Custom loop with conditional logic
describe('OrderService', () => {
  it('handles various order states', () => {
    const orders = getTestOrders();

    for (const order of orders) {
      if (order.isPaid) {
        expect(sut.process(order)).toBe(true);
      } else {
        expect(sut.process(order)).toBe(false);
      }
    }
  });
});

// ✅ Good - Separate tests for distinct behaviors
describe('OrderService', () => {
  describe('processOrder', () => {
    it('returns true when order is paid', () => {
      const paidOrder = createPaidOrder();
      expect(sut.process(paidOrder)).toBe(true);
    });

    it('returns false when order is unpaid', () => {
      const unpaidOrder = createUnpaidOrder();
      expect(sut.process(unpaidOrder)).toBe(false);
    });
  });
});

// ✅ Also Good - Use it.each for similar test cases with different inputs
describe('Calculator', () => {
  describe('add', () => {
    it.each([
      { a: 1, b: 2, expected: 3 },
      { a: 5, b: 10, expected: 15 },
      { a: -1, b: 1, expected: 0 },
    ])('returns $expected when adding $a and $b', ({ a, b, expected }) => {
      const result = calculator.add(a, b);
      expect(result).toBe(expected);
    });
  });
});

// ✅ Also Good - Table notation for better readability with many test cases
describe('Calculator', () => {
  describe('multiply', () => {
    it.each`
      a     | b     | expected
      ${2}  | ${3}  | ${6}
      ${5}  | ${4}  | ${20}
      ${-1} | ${5}  | ${-5}
      ${0}  | ${10} | ${0}
    `('returns $expected when multiplying $a and $b', ({ a, b, expected }) => {
      const result = calculator.multiply(a, b);
      expect(result).toBe(expected);
    });
  });
});
```

## Asynchronous Testing

- Always use `async`/`await` syntax for asynchronous tests (avoid `.then()` chaining)
- Mark test functions with `async` when testing promises or async operations
- Use `await` to ensure asynchronous operations complete before assertions
- For component tests, use Testing Library's async utilities (`waitFor`, `findBy*` queries)
- Set appropriate timeouts for long-running operations if needed

**Examples:**

```typescript
// ✅ Good - async/await syntax
describe('UserService', () => {
  describe('fetchUser', () => {
    it('returns user data when API call succeeds', async () => {
      const userId = 'user-123';
      const expectedUser = { id: userId, name: 'John Doe' };
      const apiClient = { get: vi.fn().mockResolvedValue(expectedUser) };
      const sut = new UserService(apiClient);

      const result = await sut.fetchUser(userId);

      expect(result).toEqual(expectedUser);
    });

    it('handles network errors gracefully', async () => {
      const apiClient = {
        get: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      const sut = new UserService(apiClient);

      await expect(sut.fetchUser('user-123')).rejects.toThrow('Network error');
    });
  });
});

// ✅ Good - Component test with async utilities
describe('UserProfile', () => {
  it('displays user name after loading', async () => {
    const user = { id: '1', name: 'Jane Smith' };
    const mockFetch = vi.fn().mockResolvedValue(user);
    render(<UserProfile userId="1" fetchUser={mockFetch} />);

    const userName = await screen.findByText('Jane Smith');

    expect(userName).toBeInTheDocument();
  });

  it('shows loading state while fetching data', async () => {
    const mockFetch = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ name: 'Test' }), 100)
          )
      );
    render(<UserProfile userId="1" fetchUser={mockFetch} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});

// ❌ Bad - Using .then() chains
describe('UserService', () => {
  it('fetches user', () => {
    return sut.fetchUser('123').then((result) => {
      expect(result).toBeDefined();
    });
  });
});

// ❌ Bad - Missing await
describe('UserService', () => {
  it('fetches user', async () => {
    const result = sut.fetchUser('123'); // Missing await!
    expect(result).toEqual({ id: '123' }); // Will fail - result is a Promise
  });
});
```

## Error and Exception Testing

- Use `.toThrow()` matcher for synchronous error testing
- Use `.rejects.toThrow()` for asynchronous error testing
- Verify specific error messages or error types when relevant
- Wrap synchronous throwing code in an arrow function for `.toThrow()`
- Test both error paths and success paths for complete coverage

**Examples:**

```typescript
// ✅ Good - Testing synchronous errors
describe('Validator', () => {
  describe('validateEmail', () => {
    it('throws error when email is empty', () => {
      const sut = new Validator();

      expect(() => sut.validateEmail('')).toThrow('Email is required');
    });

    it('throws ValidationError for invalid format', () => {
      const sut = new Validator();

      expect(() => sut.validateEmail('invalid-email')).toThrow(ValidationError);
    });

    it('throws error with specific message for missing @ symbol', () => {
      const sut = new Validator();

      expect(() => sut.validateEmail('invalidemail.com')).toThrow(
        'Email must contain @ symbol'
      );
    });
  });
});

// ✅ Good - Testing asynchronous errors
describe('PaymentService', () => {
  describe('processPayment', () => {
    it('throws error when payment fails', async () => {
      const paymentGateway = {
        charge: vi
          .fn()
          .mockRejectedValue(new PaymentError('Insufficient funds')),
      };
      const sut = new PaymentService(paymentGateway);

      await expect(sut.processPayment({ amount: 100 })).rejects.toThrow(
        'Insufficient funds'
      );
    });

    it('throws PaymentError for declined cards', async () => {
      const paymentGateway = {
        charge: vi.fn().mockRejectedValue(new PaymentError('Card declined')),
      };
      const sut = new PaymentService(paymentGateway);

      await expect(sut.processPayment({ amount: 100 })).rejects.toThrow(
        PaymentError
      );
    });
  });
});

// ✅ Good - Testing error with partial message match
describe('AuthService', () => {
  describe('login', () => {
    it('throws error containing username when user not found', async () => {
      const username = 'nonexistent@example.com';
      const sut = new AuthService();

      await expect(sut.login(username, 'password')).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(username),
        })
      );
    });
  });
});

// ❌ Bad - Not wrapping synchronous throw in arrow function
describe('Validator', () => {
  it('throws error for invalid input', () => {
    const sut = new Validator();
    expect(sut.validateEmail('')).toThrow(); // Wrong! This will fail
  });
});

// ❌ Bad - Using try/catch instead of Vitest matchers
describe('Validator', () => {
  it('throws error for invalid input', () => {
    const sut = new Validator();
    let error;

    try {
      sut.validateEmail('');
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined(); // Less readable than .toThrow()
  });
});
```

## Assertions and Verification

### One Test, One Reason to Fail

- Each test should fail for **one reason only**
- Do not verify multiple unrelated behaviors in a single test method
- **Exception**: Multiple assertions are acceptable if they verify a single behavior from different angles

**Examples:**

```typescript
// ✅ Good - Multiple assertions for one behavior
describe('UserService', () => {
  describe('createUser', () => {
    it('creates user with correct properties when given valid data', () => {
      const userData = { name: 'John', email: 'john@example.com', age: 30 };

      const user = sut.createUser(userData);

      expect(user.name).toBe('John');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(30);
      // All assertions verify the same behavior: user creation with correct data
    });
  });
});

// ❌ Bad - Multiple unrelated behaviors
describe('UserService', () => {
  it('performs various operations', () => {
    expect(sut.createUser(data)).toBeDefined();
    expect(sut.deleteUser(id)).toBe(true);
    expect(sut.findUser(id)).toBeNull();
    // Each assertion tests a different behavior
  });
});
```

### Choosing What to Verify

**State-Based Verification (Preferred):**

- Verify return values and object state changes
- Check observable outcomes of method calls
- More resilient to refactoring

**Communication-Based Verification (Use Sparingly):**

- Verify interactions **only** for side-effect boundaries:
  - **External APIs**: Email services, payment gateways, third-party APIs
  - **Observability**: Loggers, metrics, event emitters
  - **Message buses**: Event publishers, queue producers
- **Do not verify** calls to pure data providers (collaborators that only return values without side effects)
- **Guideline**: If the dependency's purpose is to provide data for computation, verify the computation result, not the call

**Examples:**

```typescript
// ✅ Good - State-based verification
describe('ShoppingCart', () => {
  describe('addToCart', () => {
    it('increases cart total when adding valid product', () => {
      const product = createProduct({ price: 50 });

      sut.addToCart(product);

      expect(sut.getTotal()).toBe(50);
    });
  });
});

// ✅ Good - Communication-based for unmanaged dependency
describe('OrderService', () => {
  describe('processOrder', () => {
    it('sends confirmation email when processing valid order', () => {
      const emailService = vi.fn();
      const sut = new OrderService(emailService);
      const order = createOrder();

      sut.processOrder(order);

      expect(emailService).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: order.id })
      );
    });
  });
});

// ❌ Bad - Verifying pure data provider calls
describe('Calculator', () => {
  it('calls getPrice once', () => {
    const priceProvider = vi.fn(() => 100); // Pure data provider
    const sut = new Calculator(priceProvider);

    sut.calculateTotal();

    expect(priceProvider).toHaveBeenCalledTimes(1); // Don't verify data providers!
  });
});

// ✅ Better - Verify the computation result instead
describe('Calculator', () => {
  it('calculates correct total using provided price', () => {
    const priceProvider = vi.fn(() => 100);
    const sut = new Calculator(priceProvider);

    const total = sut.calculateTotal();

    expect(total).toBe(100); // Verify the result, not the call
  });
});
```

### Use Vitest's Expressive Matchers

- Use Vitest's built-in matchers that read like English sentences
- For component tests, use Testing Library's semantic queries (`getByRole`, `getByLabelText`, etc.)
- Choose matchers that clearly express intent

**Examples:**

```typescript
// ✅ Good - Expressive Vitest matchers
expect(result).toBeGreaterThan(0);
expect(user.email).toContain('@');
expect(errors).toHaveLength(2);
expect(response).toMatchObject({ status: 'success' });

// ❌ Less readable - Manual comparisons
expect(result > 0).toBe(true);
expect(user.email.includes('@')).toBe(true);
expect(errors.length === 2).toBe(true);

// ✅ Good - Testing Library semantic queries
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toBeInTheDocument();

const input = screen.getByLabelText('Email');
expect(input).toHaveValue('test@example.com');

// ❌ Bad - Testing implementation details
const button = container.querySelector('.submit-button');
expect(button?.textContent).toBe('Submit');
```

## Test Doubles (Mocks and Stubs)

### When to Use Mocks

**Unmanaged Dependencies (Mock these):**

- Out-of-process dependencies you don't control: email servers, message buses, third-party APIs, payment gateways
- Dependencies with side effects that cross system boundaries
- Replace with mocks to verify interactions

**Managed Dependencies (Context-dependent):**

- **In Unit Tests**: Mock at the repository/data access boundary (e.g., mock `UserRepository`, not the database)
- **In Integration Tests**: Use real implementations with test infrastructure (in-memory database, Testcontainers)
- **Rationale**: Unit tests should be fast and isolated; integration tests verify database interactions

**Domain Logic (Never mock):**

- Domain models and business logic classes
- Internal application classes
- Always use real objects for domain logic

### Avoid Mock Overuse

- Limit the number of mocks per test (ideally 1-2, maximum 3)
- Excessive mock setup indicates design problems
- Consider refactoring if test setup becomes complex
- **Code smell**: Tests that spend more lines on mock setup than actual testing

**Examples:**

```typescript
// ❌ Bad - Too many mocks
describe('OrderService', () => {
  it('processes order', () => {
    const repository = vi.fn();
    const emailService = vi.fn();
    const smsService = vi.fn();
    const paymentGateway = vi.fn();
    const logger = vi.fn();
    const cache = vi.fn();
    // ... 20 lines of mock setup ...

    const result = sut.processOrder(order);

    // Test is buried under mock complexity
  });
});

// ✅ Good - Minimal mocking
describe('OrderService', () => {
  describe('processOrder', () => {
    it('sends email notification', () => {
      const emailService = vi.fn();
      const sut = new OrderService(emailService);
      const order = createValidOrder();

      sut.processOrder(order);

      expect(emailService).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: order.id })
      );
    });
  });
});
```

## Setup and Sharing

### Test Independence

- Each test must be completely independent of others
- Tests must pass regardless of execution order
- **Never** share state between tests using static fields or class-level variables
- Each test should set up and tear down its own state

### Avoid beforeEach for Test Data

- Minimize use of `beforeEach` for test data initialization
- `beforeEach` increases coupling between tests and reduces readability
- **Problem**: Readers must jump between test and setup block to understand context
- **Acceptable use**: Resetting shared mocks or test environment cleanup

**Instead, use:**

- Factory functions (helper functions)
- Object Mother pattern
- Test Data Builder pattern
- Explicit setup within each test

**Examples:**

```typescript
// ❌ Bad - beforeEach with test data
describe('OrderService', () => {
  let sut: OrderService;
  let testCustomer: Customer;
  let testProduct: Product;

  beforeEach(() => {
    sut = new OrderService();
    testCustomer = new Customer({ name: 'Test' });
    testProduct = new Product({ price: 100 });
  });

  it('does something', () => {
    // Unclear what testCustomer and testProduct represent
    const result = sut.processOrder(testCustomer, testProduct);
    expect(result).toBeDefined();
  });
});

// ✅ Good - Factory functions
describe('OrderService', () => {
  it('creates order when given valid customer and product', () => {
    const sut = createOrderService();
    const customer = createValidCustomer();
    const product = createProduct({ price: 100 });

    const result = sut.processOrder(customer, product);

    expect(result.total).toBe(100);
  });
});

// Factory functions
function createOrderService(): OrderService {
  return new OrderService(createRepository());
}

function createValidCustomer(): Customer {
  return new Customer({ name: 'John Doe', email: 'john@example.com' });
}

function createProduct(options: Partial<Product> = {}): Product {
  return new Product({ name: 'Test Product', price: 100, ...options });
}

// ✅ Acceptable - beforeEach for cleanup
describe('DateService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns current date', () => {
    vi.setSystemTime(new Date('2024-01-01'));
    expect(sut.getCurrentDate()).toEqual(new Date('2024-01-01'));
  });
});
```

### Reusing Test Fixtures

- Extract common initialization logic into reusable factory methods
- Share factory methods across test files when appropriate
- Keep factories focused and composable
- **Pattern**: Object Mother for complex domain objects, Builder for flexible construction

## Maintenance

### Refactoring Test Code

- Refactor test code alongside production code
- Well-designed tests (testing behavior, not implementation) require minimal changes during refactoring
- Eliminate duplicated test code and unclear setup logic
- If many tests break after refactoring production code, the tests were likely coupled to implementation details

### Delete Dead Code

- Remove commented-out tests immediately
- Delete tests that are no longer executed or relevant
- **Never** commit disabled tests without a clear plan to fix them
- Dead test code creates confusion and maintenance burden

**Examples:**

```typescript
// ❌ Bad
describe('OrderService', () => {
  // it('old behavior that no longer applies', () => {
  //   // This test is outdated
  // });

  // TODO: Fix this test later
  it.skip('broken test that fails', () => {
    // Disabled without clear plan
  });

  it('processes order with valid data', () => {
    // Active test
  });
});

// ✅ Good - Only active, relevant tests
describe('OrderService', () => {
  describe('processOrder', () => {
    it('creates order when given valid data', () => {
      // Active, maintained test
    });

    it('throws error when data is invalid', () => {
      // Active, maintained test
    });
  });
});
```

## Summary

These guidelines ensure that test code in K2BG projects is:

- **Maintainable**: Tests survive refactoring and remain clear over time
- **Readable**: Tests serve as living documentation of system behavior
- **Reliable**: Tests verify meaningful behavior, not implementation details
- **Independent**: Each test can run in isolation without side effects

Apply these principles consistently to build a robust, valuable test suite that supports rapid development and confident refactoring.

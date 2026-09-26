---
paths: "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"
---

# Unit Test Guidelines

## Overview

Comprehensive coding standards for writing high-quality unit tests. These guidelines emphasize testing behavior over implementation, maintaining test code quality equal to production code, and following established patterns for test structure and organization.

**Testing Stack:**

- **Unit/Integration Tests**: Vitest
- **Component Tests**: Vitest + Testing Library (@testing-library/react)

## General Principles

### Test Behavior, Not Implementation

- Tests must verify "units of behavior" rather than "units of code" (classes or methods)
- Validate observable results (return values, state changes, required external effects) at the smallest public boundary that shows the behavior
- Specify expected results from the public contract as literals stated in the test. An expectation computed with the formula or constant the implementation uses cannot detect an error in that formula or constant; when the constant is a tuning value, assert the relation the code guarantees (zero at zero, proportionality, clamping) instead. A production table may drive test inputs (each entry of a list the component renders) and a production default may confirm that a fallback is applied, because the test then checks selection or pass-through, not the table's content
- Keep semantic chart behavior (thresholds, data gaps, keyboard interaction), deterministic calculations, persistence outcomes, and security outputs covered
- Verify decorative appearance through stories, Chromatic, and Scene Studio demo compositions; the split between appearance and behavior is stated in "What Needs a Test". A CSS class is a unit-test oracle only when it exposes a functional state at the public boundary. A style string that a function derives from its input (direction, position, opacity, frame) is a deterministic calculation, tested with spec literals
- Avoid testing private methods or internal state
- **Rationale**: Tests coupled to implementation details hinder refactoring and reduce resistance to change

### Tests as Specification

- Treat test code as "living documentation" that defines how the system should behave
- Behavior under the bar in "What Needs a Test" that no test asserts is considered non-existent; behavior outside the bar needs no test to exist
- Write only the minimum code necessary to make a failing test pass (Test-First/TDD recommended)
- Every test should document a specific expected behavior

### Keep Test Code CLEAN

- Test code is as important as production code and requires maintenance
- Apply the same quality principles to tests: high cohesion, loose coupling, encapsulation, assertiveness, non-redundancy
- Refactor test code when it becomes difficult to understand or maintain
- Avoid code duplication in test setup and assertions

## What Needs a Test

A behavior needs a test when its regression would silently yield a wrong user-visible result, accept invalid input at a trust boundary, reject valid configuration, or lose a stated security, persistence, operational-output, or external-effect guarantee (redaction of a sensitive field in emitted logs, a persisted row, a failure log the operator relies on, an email or upload that must happen, a cost bound a cache provides). The same bar decides whether a missing test is a review finding and whether an existing test is kept. A test is required for a reachable input to the current code whose outcome no test asserts; that a hypothetical edit (a transform added, a clock returning seconds) would fail no test is not by itself a reason for a test. Mutation-level coverage — every line that can change without a test failing — is not the goal.

### Test the Decision Where It Is Made

- Domain rules, use-case orchestration, adapter mapping and error wrapping, server routes and middleware, helpers, hooks, and scripts that decide at runtime; authentication, redirect, and not-found guards; state changes and effects inside components (submission, error, empty, and disabled states); a configured strategy that would keep working only while hard-coded; a schema that must accept every valid value; a validation that must not short-circuit past an invalid value. The behavior decides, not the file type: a route matcher or a guard is logic wherever it lives
- Semantic chart thresholds, gaps, keyboard interaction, and deterministic calculations are behavior even when their results affect appearance (where a chart draws its zero baseline, where an animated element sits at a given frame)
- An accessible role or name, an attribute that changes what assistive technology announces or how the keyboard reaches an element (`aria-live`, `aria-expanded`, `tabIndex`), a link target, whether an element renders under a condition, and an attribute a consumer relies on (a forwarded class name, `colSpan`, `data-*` state) are behavior, asserted with role and accessible-name queries (a caption that names its table)

### Not a Required Test

Each of these is neither a review finding nor a reason to keep a test, unless the test also carries a guarantee from the list above:

- Forwarding or wiring between units that each have their own tests: a use case passing a configured value to a query service, a file that only composes tested units, dependency wiring. The unit under review needs a test only for a value it selects at runtime
- Interaction assertions (call counts, called once, not called) for efficiency. They are required only for an externally meaningful effect whose absence or duplication changes a result, cost, or security
- An output field no consumer reads
- Sibling constraints of one tested pattern: fields validated by the same schema construct, inputs the same expression treats alike, and the same validator's rejection re-checked per enum member are one behavior with one asserting test. Accepting every configuration value the app promises is a separate contract, verified by the one representative fixture below; an existing per-value acceptance test stays only while no such fixture exists
- A declarative schema passing a valid value through unchanged (an explicit enum value, an optional string, a `strictObject` field); that tests the library. A schema is covered by rejection of invalid values at the trust boundary, defaults, custom refinements and transforms, and one representative valid fixture that loads and uses every configuration value the app promises (every value of an enum that a definition file may name)
- A declaration whose correctness is its literal value (static metadata, header lists, workflow steps), unless a wrong value reaches users or an integration (a link target, a canonical URL, a robots rule, a security scheme name, a compatibility pin, a shared value assigned to a public slot)
- Decorative appearance: styling, tokens, layout composition, and ARIA marks on decorative elements such as `aria-hidden` on an icon. Stories, Chromatic, the Storybook accessibility check, and Scene Studio demo compositions verify it. An existing unit test of decorative appearance is deleted once a story or demo composition shows the state, as "Retaining, Improving, Moving, and Deleting Tests" states; in a package with no story or demo layer it stays
- A helper extracted only to be tested. Tests assert at the public units that `.claude/rules/code-style.md` ("Inline Needless Functions") keeps — a domain rule, a use case, an adapter mapper, a DI factory, a component — and a branch, visual or not, is asserted through the unit that contains it
- Diagnostic logging alone; operational output contracts and security properties remain covered (see Communication-Based Verification)
- Code that only guards a scenario the reach rule in `AGENTS.md` ("Codex Review Guidelines") excludes; canonical ordering of internal keys and exotic input details, unless a user-visible result depends on them

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
// Good - Descriptive, present tense
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

// Bad - Vague, abbreviated
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
      it('preserves the account balance', () => {});
    });
  });
});
```

### Variable Names

- Name the system under test instance variable as `sut` (System Under Test) to clearly distinguish it from dependencies
- Use named expected values when they clarify the domain meaning of a number or string
- Literal expected values are appropriate when their meaning is clear from the assertion and test name; avoid unexplained magic values

**Examples:**

```typescript
// Good
const expectedAge = 21;
expect(person.age).toBe(expectedAge);

const minimumPasswordLength = 8;
expect(password.length).toBeGreaterThanOrEqual(minimumPasswordLength);

// Also appropriate when the test describes the expected status
expect(response.status).toBe(404);
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
      const sut = new PricingService();
      const customer = new Customer({ type: 'VIP' });
      const originalPrice = 100;

      const discountedPrice = sut.calculateDiscount(customer, originalPrice);

      const expectedPrice = 80;
      expect(discountedPrice).toBe(expectedPrice);
    });
  });
});
```

**Guidelines:**

- Use blank lines to visually separate the three phases
- Do NOT add phase comments (`// Arrange`, `// Act`, `// Assert`) - they add noise without value
- The code structure itself should make the phases clear

### Single Action in Act Phase

**For Unit Tests:**

- The Act phase should ideally be **one line** (a single method invocation)
- Multiple lines may indicate poor API design or testing too large a unit of behavior

**For Component Tests:**

- The Act phase represents **one user intent** (may span multiple lines for user interactions)
- Example: Filling a form and submitting is one intent, even if it requires multiple `userEvent` calls
- Keep the intent focused and atomic

### Parameterize Equivalent Behavior Cases

- Use Vitest's `it.each()` or `describe.each()` for repeated Act/Assert cases with the same behavioral oracle; name the scenario in each row
- `it.each` is notation for cases already selected under "What Needs a Test"; it does not add cases. Inputs the same expression treats alike (null, undefined, and blank strings all read as "empty") are one behavior with one asserting row, and siblings of one tested constraint need no row of their own
- Keep distinct behaviors and boundary expectations explicit instead of branching inside a test
- Fixture construction may use clear loops, data transformations, or bulk inserts in Arrange. These do not represent parameterized behavior cases unless they repeat actions and assertions
- Test doubles may select incoming data by input; keep that selection simple and separate from the expected result

**Examples:**

```typescript
// Bad - Custom loop with conditional logic
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

// Good - Separate tests for distinct behaviors
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

// Good - Use it.each for similar test cases with different inputs
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

// Good - Table notation for better readability with many test cases
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
- For an element that appears asynchronously, use the matching `findBy*` query
- Use `waitFor` for callback effects or state conditions that a single async element query cannot express, including disappearance
- Set appropriate timeouts for long-running operations if needed

**Examples:**

```typescript
// Good - async/await syntax
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

// Good - Component test with async utilities
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

// Bad - Using .then() chains
describe('UserService', () => {
  it('fetches user', () => {
    return sut.fetchUser('123').then((result) => {
      expect(result).toBeDefined();
    });
  });
});

// Bad - Missing await
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
- Test the error paths and the success paths that "What Needs a Test" covers: the rejection at a trust boundary, the wrapped failure, the fallback a user sees

**Examples:**

```typescript
// Good - Testing synchronous errors
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
  });
});

// Good - Testing asynchronous errors
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
  });
});

// Bad - Not wrapping synchronous throw in arrow function
describe('Validator', () => {
  it('throws error for invalid input', () => {
    const sut = new Validator();
    expect(sut.validateEmail('')).toThrow(); // Wrong! This will fail
  });
});

// Bad - Using try/catch instead of Vitest matchers
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

### Choosing What to Verify

**State-Based Verification (Preferred):**

- Verify return values and object state changes
- Check observable outcomes of method calls
- More resilient to refactoring

**Communication-Based Verification (Use Sparingly):**

- Assert outgoing interactions only when the call is the requirement: an externally observable effect (sending email, uploading an image, revalidating a path), a documented request contract to an external API or driver (a Notion filter, Cloudinary upload options, postgres pool options), an ordering or guard rule (a rate limit checked before a captcha, validation before any side effect), or a single-flight rule whose violation changes cost or security (one connection per Lambda, one loader call per cache key). A call count that only proves efficiency is not asserted. Prefer an input-keyed fake whose output proves the call: it fails when the request is wrong without listing arguments
- Configure incoming data stubs to produce the scenario and assert the resulting output or state, not the stub's calls. An input-keyed fake can prove correct selection without exposing invocation details
- A third-party API or vendor name alone does not justify interaction assertions
- Do not assert diagnostic log calls or payloads. Assert the return value, error, or state that exposes the failure. A log assertion inside a test that also asserts a real outcome is removed from that test
- Retain logging assertions for an operational output contract: the request log fields stated in `.claude/rules/hono-api-guidelines.md`, error-level logging of failures, the warn/error discrimination in `.claude/rules/error-handling-guidelines.md`, and redaction in the logger's emitted output. Assert the level and the structured fields, not the message text, unless the text is the contract

### Use Vitest's Expressive Matchers

- Use Vitest's built-in matchers that read like English sentences
- Prefer role and accessible name queries for interactive elements. Use label queries for form controls and text queries for static user-visible content when no stronger semantic query expresses the contract
- Choose matchers that clearly express intent

**Examples:**

```typescript
// Good - Expressive Vitest matchers
expect(result).toBeGreaterThan(0);
expect(user.email).toContain('@');
expect(errors).toHaveLength(2);
expect(response).toMatchObject({ status: 'success' });

// Less readable - Manual comparisons
expect(result > 0).toBe(true);
expect(user.email.includes('@')).toBe(true);
expect(errors.length === 2).toBe(true);

// Good - Testing Library semantic queries
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toBeInTheDocument();

const input = screen.getByLabelText('Email');
expect(input).toHaveValue('test@example.com');

// Bad - Testing implementation details
const button = container.querySelector('.submit-button');
expect(button?.textContent).toBe('Submit');
```

## Test Doubles (Mocks and Stubs)

### When to Use Mocks

**Unmanaged Dependencies:**

- Replace out-of-process dependencies you do not control, such as email servers, message buses, third-party APIs, and payment gateways, with test doubles
- Use stubs for incoming data and assert outputs. Use mocks to verify outgoing effects only under the communication-based verification rules above

**Managed Dependencies (Context-dependent):**

- **In Unit Tests**: Stub or fake the repository/data access boundary and assert the use case's observable behavior
- **In Database Integration Tests**: Use the real managed test database and assert persisted state freshly queried after the operation. Exercise transactions and concurrency where they are part of the behavior; ORM call assertions do not establish persistence correctness

**Domain Logic (Never mock):**

- Domain models and business logic classes
- Internal application classes
- Always use real objects for domain logic

### Avoid Mock Overuse

- Use each test double to supply scenario inputs or observe an externally meaningful boundary; there is no numerical mock limit
- Reconsider the test boundary when dependency setup obscures the behavior
- Keep real domain objects and avoid replacing internal computation with mocks

## Setup and Sharing

### Test Independence

- Each test must be completely independent of others
- Tests must pass regardless of execution order
- **Never** share state between tests using static fields or class-level variables
- Each test should set up and tear down its own state

### Avoid beforeEach for Test Data

- Minimize use of `beforeEach` for test data initialization
- `beforeEach` increases coupling between tests and reduces readability
- **Acceptable use**: Resetting shared mocks or test environment cleanup

**Instead, use:**

- Factory functions (helper functions)
- Object Mother pattern
- Test Data Builder pattern
- Explicit setup within each test

**Examples:**

```typescript
// Bad - beforeEach with test data
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

// Good - Factory functions
describe('OrderService', () => {
  it('creates order when given valid customer and product', () => {
    const sut = createOrderService();
    const customer = createValidCustomer();
    const product = createProduct({ price: 100 });

    const result = sut.processOrder(customer, product);

    expect(result.total).toBe(100);
  });
});

// Acceptable - beforeEach for cleanup
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

## Maintenance

### Refactoring Test Code

- Refactor test code alongside production code
- Well-designed tests (testing behavior, not implementation) require minimal changes during refactoring
- If many tests break after refactoring production code, the tests were likely coupled to implementation details

### Delete Dead Code

- Remove commented-out tests immediately
- Delete tests that are no longer executed or relevant
- **Never** commit disabled tests without a clear plan to fix them

### Retaining, Improving, Moving, and Deleting Tests

Classify each `it` or `it.each` row by the defect it detects under the bar in "What Needs a Test", whether it breaks on legitimate change, and whether it is worth maintaining. Ask the questions in this order; the first match decides, and deletion is decided in steps 1 and 2 only:

1. Name the requirement the test protects under the bar. When none can be named — the test returns the constant it imports with no slot choice, forwards a value unchanged, counts calls for efficiency, reads an output no consumer reads, or re-derives a library's documented behavior with no repository configuration involved — delete it. A symptom with a requirement behind it (a stub echo, `toBeDefined`, a production-derived expectation) continues to step 4. A test whose only observable is decorative appearance is not deleted here or in step 2; it goes to step 3.
2. Delete a test when another test asserts the same input class with the same expected result through the same expression at the same boundary. A composition test (an app that mounts its authentication middleware and routes) and a unit test of one part (the middleware alone) are different guarantees and both stay. A per-value acceptance test of a promised configuration value is a copy only when a representative valid fixture that uses every promised value exists; until then it stays.
3. Move a test that asserts only decorative appearance to a story or to a Scene Studio demo composition. The unit test is deleted once a story or demo shows that state; Chromatic and the demo compositions are the verification, and a blocking CI check is not required. When no story or demo shows the state, the same pull request adds one and then deletes the unit test. In a package with no story or demo layer, the decorative unit test stays.
4. Improve a test whose requirement is real but whose oracle is weak (production-derived expectation, stub-call assertion where the output is observable, existence-only assertion, diagnostic message text) or fragile (shared mutable state, real timers, order dependence, mocks of internal helpers, a name that does not describe the assertion): restate the assertion at the public boundary as a spec literal or a relation, use an input-keyed fake, make the test self-contained.
5. Keep everything else, including static values whose wrong edit reaches users or integrations, values assigned to a public slot, tests of the repository's configuration of a library, and smoke tests that a subsystem initializes.

A test attribute alone — static, appearance, duplicate, stub, log, uncovered line — never decides deletion.

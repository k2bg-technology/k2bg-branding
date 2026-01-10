# Copilot Instructions - K2BG Branding

This document outlines the coding rules and patterns established in this Next.js Turborepo project for consistent AI-assisted development.

## Project Structure

This is a **Turborepo monorepo** containing:

- **Blog app** (`apps/blog/`) - Content management with Notion CMS
- **Portfolio app** (`apps/portfolio/`) - Multilingual portfolio site
- **Shared packages** (`packages/`) - UI components, configs, and utilities

## File Naming Conventions

### Components

- React Components: **PascalCase** (`Header.tsx`, `ArticleHeading.tsx`)
- Component Tests: **camelCase** with `.test.ts/tsx` (`useSnsShareInfo.test.ts`)
- Component Stories: **PascalCase** with `.stories.tsx` (`Button.stories.tsx`)

### Directories

- Component directories: **kebab-case** (`article-heading/`, `sns-share-button/`)
- Domain/module directories: **camelCase** (`dataAccess/`, `useCases/`)

### Files

- Utility files: **camelCase** (`generateHtmlTemplate.ts`, `getExtensionFromUrl.ts`)
- Entity/domain files: **PascalCase** (`Entity.ts`, `Repository.tsx`)
- Config files: **lowercase** (`globals.css`, `middleware.ts`)

## Component Patterns

### Component Structure

```typescript
interface Props {
  article: Post;
}

export async function ArticleHeading(props: Props) {
  const { article } = props;
  // Component logic
}
```

### Props Interface

- Always name the main props interface as `Props`
- Use composition with `extends` for HTML element props:

```typescript
interface Props
  extends Omit<React.ComponentPropsWithRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### Component Organization

```
components/
├── component-name/
│   ├── ComponentName.tsx
│   ├── ComponentName.stories.tsx (if UI component)
│   └── componentName.test.ts
```

## Import/Export Patterns

### Import Order (Biome enforced)

```typescript
// 1. External libraries
import Link from 'next/link';
import { Button, Drawer, DropdownMenu } from 'ui';

// 2. Internal components (relative imports)
import { CompanyLogo } from '../company-logo/CompanyLogo';

// 3. Domain/business logic
import { Category } from '../../modules/domain/post/types';

// 4. Local/same-directory imports
import MotionHeader from './MotionHeader';
```

### Workspace Dependencies

- Use `workspace:*` for internal packages in package.json
- Import from UI package: `import { Button, Icon } from 'ui'`

### Export Patterns

- **Default exports** for main components
- **Named exports** for utilities and types
- **Barrel exports** with re-exports:

```typescript
export * from './entity';
export * from './types';
```

## TypeScript Patterns

### Type Definitions

```typescript
// Const assertions for enums
export const Category = {
  ENGINEERING: 'ENGINEERING',
  DESIGN: 'DESIGN',
} as const;
export type Category = (typeof Category)[keyof typeof Category];
```

### Configuration Requirements

- **Strict mode enabled** across all packages
- **Composite projects** with shared tsconfig
- **Path mapping** through workspace resolution

## Architecture Patterns

### Blog App - Clean Architecture

```
modules/
├── domain/           # Business entities and core logic
├── data-access/      # External integrations (Notion, Prisma, etc.)
├── use-cases/        # Application business rules
└── interfaces/       # Input validation and adapters
```

### Repository Pattern

```typescript
export class PostRepository {
  async findById(id: string): Promise<Post | null> {
    // Implementation
  }
}
```

### Entity Pattern

```typescript
export class PostEntity {
  constructor(private readonly post: PostData) {}

  toObject(): Post {
    return {
      id: this.post.id,
      title: this.post.title,
      // ...
    };
  }
}
```

## State Management

### React Query

- Use for server state management
- Wrap app with `ReactQueryClientProvider`

### Custom Hooks

- Prefix with `use` (`useSnsShareInfo`, `useMatchMedia`)
- Co-locate with components when component-specific

### Zustand (if used)

- Use for client-side global state
- Keep stores focused and minimal

## Testing Patterns

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should describe behavior', () => {
    // Test implementation
  });
});
```

### Test Organization

- **Co-locate tests** with components
- Use `.test.ts/.test.tsx` extensions
- Test edge cases (empty states, special characters, i18n)

## Code Style

### Biome Configuration

- **Linting and formatting** unified in one tool
- **Import ordering** with newlines between groups
- **React hooks** rules enabled
- **Accessibility** rules enabled

### Formatting Preferences

- Configured via `biome.jsonc`
- **Consistent formatting** across all files
- **Auto-fix on save** recommended

## Validation and Error Handling

### Schema Validation

```typescript
// Use Zod for validation
export const postSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .extend({
    author: authorSchema,
  });
```

### Error Handling

- Use try-catch blocks in data fetching functions
- Implement proper error boundaries for React components

## Performance and Optimization

### Image Handling

- Use **Next.js Image component** for optimization
- **Cloudinary integration** for media management

### Bundle Optimization

- Use **Turbo flag** (`--turbo`) for faster development builds
- Implement **code splitting** where appropriate

## Internationalization (Portfolio App)

### i18next Pattern

```typescript
// Namespace-based translations
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('common');
```

### Language Detection

- Use **middleware-based** language detection
- **Dynamic language routing** with Next.js

## Package Management

### Dependencies

- Use **pnpm** for package management
- Use **workspace:\*** for internal dependencies
- Keep dependencies up to date and minimal

### Development Tools

- **Turbo** for monorepo orchestration
- **Biome** for linting and formatting
- **Chromatic** for visual regression testing
- **Storybook** for component documentation

## Design System (UI Package)

### Component Variants

```typescript
// Use Class Variance Authority (CVA)
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
    },
  }
);
```

### Compound Components

```typescript
// Use dot notation for compound components
export default function Button({ ... }) { ... }
Button.displayName = 'Button';
```

## Database (Blog App)

### Prisma Patterns

- Use **Prisma Client** for database operations
- Generate client with `npx prisma generate`
- Run migrations with `npx prisma migrate dev`

## Environment Configuration

### Required Variables

- `NOTION_TOKEN` - Notion API access
- `CLOUDINARY_*` - Image management
- `SEND_GRID_API_KEY` - Email service
- Database connection strings

### Configuration Files

- Use `turbo.json` for environment variable mapping
- Keep sensitive data in `.env.local`

## Development Workflow

### Commands

```bash
pnpm dev          # Start all apps
pnpm build        # Build all apps
pnpm test         # Run tests
pnpm lint         # Lint and format code with Biome
pnpm format       # Format code with Biome
```

### App-specific Development

```bash
pnpm dev --filter=blog      # Blog app only
pnpm dev --filter=portfolio # Portfolio app only
```

## Key Principles

1. **Consistency**: Follow established patterns throughout the codebase
2. **Clean Architecture**: Maintain clear separation of concerns
3. **Type Safety**: Use TypeScript strictly with proper type definitions
4. **Testing**: Write tests for critical functionality
5. **Performance**: Optimize images, bundles, and rendering
6. **Accessibility**: Follow WCAG guidelines and use semantic HTML
7. **Internationalization**: Support multiple languages where required
8. **Documentation**: Document complex logic and maintain README files

## Notes for AI Assistants

- Always check existing patterns before suggesting new approaches
- Prefer editing existing files over creating new ones
- Follow the established directory structure and naming conventions
- Use the project's configured tools (Biome, TypeScript)
- Test changes with the existing test setup
- Consider the monorepo structure when making changes
- Respect the clean architecture boundaries in the blog app

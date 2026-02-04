# K2BG Branding

A modern **Turborepo monorepo** for K2BG Branding containing a technology blog and multilingual portfolio website built with Next.js and TypeScript.

## What's Inside

### Applications

- **[Blog](apps/blog/README.md)** - Next.js blog with Notion CMS and Clean Architecture (port 3000)
- **[Portfolio](apps/portfolio/README.md)** - Multilingual portfolio with i18next (port 3001)

### Shared Packages

- **`ui`** - React component library with Storybook documentation
- **`tailwind-config`** - Shared Tailwind CSS configuration and design tokens
- **`biome-config`** - Shared Biome configurations
- **`tsconfig`** - TypeScript configurations used throughout the monorepo
- **`test-utils`** - Shared testing utilities with Vitest

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Technology Stack

- **[Next.js 15](https://nextjs.org/)** - React framework for both applications
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/repo)** - Monorepo build system
- **[pnpm](https://pnpm.io/)** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.15.9+

### Installation

```bash
git clone <repository-url>
cd k2bg-branding
pnpm install
```

## Development

### Start All Applications

```bash
pnpm dev          # Start both blog (3000) and portfolio (3001) apps
```

### Start Individual Applications

```bash
pnpm dev --filter=blog        # Blog app only
pnpm dev --filter=portfolio   # Portfolio app only
```

### Component Development

```bash
pnpm storybook             # Start Storybook for UI package
pnpm build-storybook       # Build Storybook
pnpm chromatic             # Visual regression testing
pnpm generate:component    # Generate new component scaffolding
pnpm generate:style        # Generate style files from design tokens
```

## Build & Production

```bash
pnpm build        # Build all apps and packages
pnpm start        # Start production builds
```

## Testing & Quality

```bash
pnpm test         # Run tests across all packages
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint and format all apps and packages with Biome
pnpm typecheck    # TypeScript type checking
pnpm format       # Format code with Biome
```

## Monorepo Architecture

### Overview

```mermaid
flowchart TB
    subgraph "K2BG Branding Monorepo"
        subgraph "Apps"
            Blog["Blog App<br/> (port 3000)"]
            Portfolio["Portfolio App<br/> (port 3001)"]
        end

        subgraph "Shared Packages"
            UI["ui<br/>Component Library"]
            TailwindConfig["tailwind-config<br/>Design System"]
            BiomeConfig["biome-config<br/>Code Quality"]
            TSConfig["tsconfig<br/>TypeScript Config"]
            TestUtils["test-utils<br/>Testing Utilities"]
        end
    end

    Blog -.-> UI
    Blog -.-> TailwindConfig
    Blog -.-> BiomeConfig
    Blog -.-> TSConfig
    Blog -.-> TestUtils

    Portfolio -.-> UI
    Portfolio -.-> TailwindConfig
    Portfolio -.-> BiomeConfig
    Portfolio -.-> TSConfig

    classDef appStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef packageStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff

    class Blog,Portfolio appStyle
    class UI,TailwindConfig,BiomeConfig,TSConfig,TestUtils packageStyle
```

### Development & Build Pipeline

```mermaid
flowchart TB
    subgraph "Development Environment"
        subgraph "Monorepo Management"
            Turborepo["Turborepo<br/>- Task Orchestration<br/>- Dependency Caching<br/>- Parallel Execution"]
            PNPMWorkspaces["PNPM Workspaces<br/>- Package Management<br/>- Dependency Resolution"]
        end

        subgraph "Development Tools"
            BiomeTool["Biome<br/>- Code Linting<br/>- Code Formatting<br/>- Auto-fix"]
            TypeScriptTool["TypeScript<br/>- Type Checking<br/>- Compile-time Safety"]
        end

        subgraph "Testing Framework"
            VitestTool["Vitest<br/>- Unit Testing<br/>- Test Runner"]
            StorybookTool["Storybook<br/>- Component Development<br/>- Visual Testing"]
            ChromaticTool["Chromatic<br/>- Visual Regression<br/>- UI Review"]
        end

        subgraph "Build Process"
            NextJSBuild["Next.js Build<br/>- App Compilation<br/>- Bundle Optimization"]
            TailwindBuild["Tailwind CSS<br/>- Style Processing<br/>- Purge Unused"]
            TypeGeneration["Type Generation<br/>- Prisma Client<br/>- API Types"]
        end
    end

    subgraph "Development Workflow"
        DevStart["pnpm dev"]
        BuildProcess["pnpm build"]
        TestSuite["pnpm test"]
        LintCheck["pnpm lint"]
        TypeCheck["pnpm typecheck"]
    end

    DevStart --> Turborepo
    BuildProcess --> Turborepo
    TestSuite --> Turborepo
    LintCheck --> Turborepo
    TypeCheck --> Turborepo

    Turborepo --> PNPMWorkspaces
    Turborepo --> NextJSBuild
    Turborepo --> TailwindBuild
    Turborepo --> TypeGeneration

    PNPMWorkspaces --> BiomeTool
    PNPMWorkspaces --> TypeScriptTool
    PNPMWorkspaces --> VitestTool
    PNPMWorkspaces --> StorybookTool

    StorybookTool --> ChromaticTool

    classDef monorepoStyle fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff
    classDef devToolStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef testStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef buildStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef workflowStyle fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff

    class Turborepo,PNPMWorkspaces monorepoStyle
    class BiomeTool,TypeScriptTool devToolStyle
    class VitestTool,StorybookTool,ChromaticTool testStyle
    class NextJSBuild,TailwindBuild,TypeGeneration buildStyle
    class DevStart,BuildProcess,TestSuite,LintCheck,TypeCheck workflowStyle
```

## Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)

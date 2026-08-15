# K2BG Observatory

![An observatory on a hilltop at night, watching over a city skyline that dissolves into glowing charts and constellation graphs](public/images/hero.jpg)

A **Next.js** application that visualizes accumulated personal data — finances, health, home environment, and web analytics — in one place. It runs locally only and is the web surface of the Observatory concept. Part of the [K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
| --- | --- |
| **Framework** | Next.js, React, TypeScript |
| **Styling** | Tailwind CSS, shared `ui` package |
| **Testing** | Vitest, Testing Library |
| **Linting** | Biome |

## Getting Started

### Prerequisites

- Node.js 20.9+
- pnpm 10+

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# From the monorepo root
pnpm -F observatory dev

# Or from this directory
pnpm dev
```

Open [http://localhost:3003](http://localhost:3003).

### Build and Test

```bash
pnpm -F observatory build      # Production build
pnpm -F observatory test       # Run once
pnpm -F observatory test:watch # Watch mode
pnpm -F observatory lint       # Run Biome checks
pnpm -F observatory typecheck  # Run TypeScript checks
```

## Project Structure

```text
apps/observatory/
├── app/
│   ├── globals.css       # Design-token and shared UI style imports
│   ├── layout.tsx        # Root layout and metadata
│   └── page.tsx          # Dashboard entry page
├── public/
│   └── images/           # Static assets (hero image)
├── next.config.mjs       # Next.js and security-header configuration
└── vitest.config.mts     # Test configuration
```

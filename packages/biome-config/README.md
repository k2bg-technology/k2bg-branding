# biome-config

Shared Biome configuration for K2BG Branding monorepo.

## Overview

This package provides a shared Biome configuration that ensures consistent code formatting and linting across all apps and packages in the monorepo.

## Features

- **Formatting**: Consistent code style with single quotes, semicolons, and 2-space indentation
- **Linting**: Biome's recommended ruleset with custom rules for React/Next.js projects
- **Import Organization**: Automatic import sorting and type import separation
- **VCS Integration**: Git-aware configuration with .gitignore support

## Usage

In your workspace's `biome.jsonc`:

```jsonc
{
  // 共有設定を継承
  "extends": ["biome-config/biome.jsonc"]
}
```

**Note**: Use `.jsonc` extension to enable JSON with Comments support.

## Configuration Highlights

- Line width: 80 characters
- Quote style: Single quotes
- Semicolons: Always
- Trailing commas: ES5
- Bracket spacing: Enabled
- Import organization: Enabled with type import separation
- Default exports: Allowed (for Next.js compatibility)

## Version

Biome v2.3.11

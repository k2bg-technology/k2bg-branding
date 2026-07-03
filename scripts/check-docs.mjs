#!/usr/bin/env node
/**
 * Verify that agent documentation (AGENTS.md, CLAUDE.md, .claude/**) does not rot:
 * 1. Backtick-quoted repo paths must exist on disk.
 * 2. Exact product version pins must not appear (package.json is the source of truth).
 * 3. Legacy-tech guard: tech that was migrated away from this repo must not re-enter
 *    the docs (AI agents tend to reproduce legacy examples from training data).
 *
 * Append `docs-check-ignore` (e.g. in an HTML comment) to a line to exempt it.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function markdownFilesUnder(directory) {
  return readdirSync(join(repositoryRoot, directory), { recursive: true })
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => join(directory, entry));
}

const documentationFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  ...markdownFilesUnder('.claude/rules'),
  ...markdownFilesUnder('.claude/skills'),
];

const PATH_PATTERN = /`((?:apps|packages|scripts|\.claude|\.github)\/[^`\s]+)`/g;
const GLOB_OR_PLACEHOLDER = /[*{}<>[\]]/;
const IGNORE_MARKER = 'docs-check-ignore';

/**
 * Re-introduction guard for tech removed from this repo.
 * Add an entry whenever a migration retires a library or tool.
 */
const REMOVED_TECH_GUARDS = [
  {
    pattern: /\bprisma\b/i,
    reason: 'Legacy tech: Prisma was replaced by Drizzle (#255) — use Drizzle in examples',
  },
  {
    pattern: /radix/i,
    reason: 'Legacy tech: Radix UI was replaced by Base UI (#254) — use @base-ui/react',
  },
  {
    pattern: /react-webpack5|@swc\/core/,
    reason: 'Legacy tech: Storybook Webpack/SWC builder was replaced by Vite (#310)',
  },
];

const VERSION_PIN_GUARD = {
  pattern:
    /\b(?:Storybook|Next\.js|React|TypeScript|Node|pnpm|Vite|Tailwind)\s+v?\d+\.\d+\.\d+\b/,
  reason: 'No exact version pins in docs — package.json is the source of truth',
};

const DENYLIST = [...REMOVED_TECH_GUARDS, VERSION_PIN_GUARD];

const failures = [];

for (const documentationFile of documentationFiles) {
  const content = readFileSync(join(repositoryRoot, documentationFile), 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes(IGNORE_MARKER)) {
      return;
    }
    const location = `${documentationFile}:${index + 1}`;

    for (const match of line.matchAll(PATH_PATTERN)) {
      const referencedPath = match[1].replace(/[.,;:]+$/, '');
      if (GLOB_OR_PLACEHOLDER.test(referencedPath)) {
        continue;
      }
      if (!existsSync(join(repositoryRoot, referencedPath))) {
        failures.push(`${location}: referenced path does not exist: ${referencedPath}`);
      }
    }

    for (const { pattern, reason } of DENYLIST) {
      if (pattern.test(line)) {
        failures.push(`${location}: ${reason} (matched ${pattern})`);
      }
    }
  });
}

if (failures.length > 0) {
  console.error(`docs:check failed with ${failures.length} problem(s):\n`);
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}

console.log(`docs:check passed (${documentationFiles.length} files scanned)`);

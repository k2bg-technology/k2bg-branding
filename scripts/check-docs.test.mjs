import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  findDocumentationProblems,
  PORTFOLIO_CONTENT_DRIFT_GUARDS,
} from './check-docs.mjs';

function runChecker(content, { existingPaths = [] } = {}) {
  return findDocumentationProblems(content, {
    fileLabel: 'DOC.md',
    pathExists: (referencedPath) => existingPaths.includes(referencedPath),
  });
}

function runPortfolioContentDriftChecker(content) {
  return findDocumentationProblems(content, {
    fileLabel: 'apps/portfolio/README.md',
    pathExists: () => true,
    denylist: PORTFOLIO_CONTENT_DRIFT_GUARDS,
    checkPaths: false,
  });
}

describe('findDocumentationProblems', () => {
  describe('referenced path existence', () => {
    it('reports a backtick-quoted repo path that does not exist', () => {
      const content = 'See `apps/blog/missing.ts` for details.';

      const failures = runChecker(content);

      assert.equal(failures.length, 1);
      assert.match(failures[0], /DOC\.md:1/);
      assert.match(failures[0], /apps\/blog\/missing\.ts/);
    });

    it('accepts a backtick-quoted repo path that exists', () => {
      const content = 'See `apps/blog/server/app.ts` for details.';

      const failures = runChecker(content, {
        existingPaths: ['apps/blog/server/app.ts'],
      });

      assert.deepEqual(failures, []);
    });

    it('strips trailing punctuation before checking the path', () => {
      const content = 'Config lives in `packages/ui/package.json`.';

      const failures = runChecker(content, {
        existingPaths: ['packages/ui/package.json'],
      });

      assert.deepEqual(failures, []);
    });

    it('skips glob patterns and placeholders instead of flagging them', () => {
      const content = [
        'Watch `apps/blog/server/**/*.ts` files.',
        'Locales live in `apps/portfolio/i18n/locales/{ja,en}/translation.json`.',
        'Errors live in `apps/blog/modules/<module>/domain/errors/errors.ts`.',
        'Routes use `apps/portfolio/app/[lang]/page.tsx`.',
      ].join('\n');

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });

    it('ignores paths outside the known repo prefixes', () => {
      const content = 'The handler is `app/api/[[...route]]/route.ts` in the blog app.';

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });

    it('reports the correct line number for a failure on a later line', () => {
      const content = 'First line is fine.\nSee `scripts/missing.mjs` here.';

      const failures = runChecker(content);

      assert.equal(failures.length, 1);
      assert.match(failures[0], /DOC\.md:2/);
    });
  });

  describe('docs-check-ignore escape hatch', () => {
    it('skips every check on a line carrying the ignore marker', () => {
      const content =
        'Output goes to `packages/ui/storybook-static` (build output). <!-- docs-check-ignore -->';

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });
  });

  describe('legacy tech re-introduction guard', () => {
    const legacyTechCases = [
      { name: 'Prisma', line: 'Use the Prisma client for persistence.' },
      { name: 'Radix UI', line: 'Built on @radix-ui/react-avatar primitives.' },
      {
        name: 'Storybook Webpack builder',
        line: "import type { Meta } from '@storybook/react-webpack5';",
      },
    ];

    for (const { name, line } of legacyTechCases) {
      it(`flags removed tech: ${name}`, () => {
        const failures = runChecker(line);

        assert.equal(failures.length, 1);
        assert.match(failures[0], /Legacy tech/);
      });
    }

    it('does not flag current tech mentions', () => {
      const content = 'Use Drizzle ORM and @base-ui/react with the Vite builder.';

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });
  });

  describe('portfolio content drift guard', () => {
    const driftCases = [
      { name: 'Prisma', line: 'Uses Prisma for persistence.' },
      { name: 'react-i18next', line: 'Uses react-i18next for translations.' },
    ];

    for (const { name, line } of driftCases) {
      it(`flags portfolio content drift: ${name}`, () => {
        const failures = runPortfolioContentDriftChecker(line);

        assert.equal(failures.length, 1);
        assert.match(failures[0], /Portfolio content drift/);
      });
    }

    it('allows current portfolio i18n and persistence wording', () => {
      const content =
        'Uses server-only dictionaries and Drizzle ORM + PostgreSQL.';

      const failures = runPortfolioContentDriftChecker(content);

      assert.deepEqual(failures, []);
    });
  });

  describe('version pin guard', () => {
    it('flags an exact product version pin', () => {
      const content = '- **Version**: Storybook 10.0.6';

      const failures = runChecker(content);

      assert.equal(failures.length, 1);
      assert.match(failures[0], /version pins/);
    });

    it('allows major-only version mentions', () => {
      const content = 'Storybook 10.x with React 19 on Node 20.';

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });

    it('allows semver ranges inside JSON dependency examples', () => {
      const content = '"package": "react", "version": "^19.0.0"';

      const failures = runChecker(content);

      assert.deepEqual(failures, []);
    });
  });
});

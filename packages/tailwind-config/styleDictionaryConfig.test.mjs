import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const tokenDirectory = new URL('./design-token/', import.meta.url);

// Headers differ across Style Dictionary versions; token values must not.
function withoutHeader(css) {
  return css.replace(/^\/\*\*[\s\S]*?\*\//, '').trim();
}

test('generates the existing CSS and JSON token values', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'style-dictionary-'));
  try {
    await mkdir(join(directory, 'design-token'));
    await writeFile(
      join(directory, 'design-token/design-tokens.tokens.json'),
      await readFile(new URL('design-tokens.tokens.json', tokenDirectory))
    );
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL('./styleDictionaryConfig.mjs', import.meta.url))],
      { cwd: directory, stdio: 'pipe' }
    );

    for (const name of [
      'variables.css',
      'color.css',
      'tailwind-theme-color.css',
      'typography.css',
      'tailwind-theme-typography.css',
      'color.json',
      'typography.json',
    ]) {
      const expected = await readFile(new URL(name, tokenDirectory), 'utf8');
      const actual = await readFile(
        join(directory, 'design-token', name),
        'utf8'
      );
      if (name.endsWith('.json')) {
        assert.deepEqual(JSON.parse(actual), JSON.parse(expected), name);
      } else {
        assert.equal(withoutHeader(actual), withoutHeader(expected), name);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

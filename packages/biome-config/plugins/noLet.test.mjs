import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const biomeBinaryPath = require.resolve('@biomejs/biome/bin/biome');
const sharedConfigPath = fileURLToPath(
  new URL('../biome.jsonc', import.meta.url)
);
const pluginPath = fileURLToPath(new URL('./noLet.grit', import.meta.url));

async function checkFixture(source) {
  const fixtureDirectory = await mkdtemp(join(tmpdir(), 'biome-no-let-'));
  const fixturePath = join(fixtureDirectory, 'fixture.ts');
  const configPath = join(fixtureDirectory, 'biome.jsonc');
  const config = {
    root: true,
    extends: [sharedConfigPath],
    plugins: [pluginPath],
    vcs: { enabled: false },
  };

  try {
    await Promise.all([
      writeFile(configPath, JSON.stringify(config, null, 2)),
      writeFile(fixturePath, source),
    ]);

    const result = spawnSync(
      biomeBinaryPath,
      [
        'lint',
        fixturePath,
        '--config-path',
        configPath,
        '--only=plugin',
        '--reporter=json',
        '--max-diagnostics=none',
      ],
      { encoding: 'utf8' }
    );

    assert.equal(result.error, undefined);

    return {
      diagnostics: JSON.parse(result.stdout).diagnostics,
      exitCode: result.status,
    };
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
}

function assertSingleNoLetDiagnostic(result) {
  assert.notEqual(result.exitCode, 0);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].category, 'plugin');
  assert.match(result.diagnostics[0].message, /\blint\/plugin\/noLet\b/);
}

describe('noLet plugin', () => {
  it('reports a reassigned let declaration', async () => {
    const result = await checkFixture('let count = 0;\ncount += 1;\n');

    assertSingleNoLetDiagnostic(result);
  });

  const declarationCases = [
    { name: 'initialized declaration', source: 'let a = 1;\n' },
    { name: 'uninitialized declaration', source: 'let a;\n' },
    { name: 'multiple declaration', source: 'let a, b;\n' },
    { name: 'object destructuring declaration', source: 'let {a} = b;\n' },
    { name: 'array destructuring declaration', source: 'let [a] = b;\n' },
    { name: 'declaration with an inline comment', source: 'let/*c*/a;\n' },
    { name: 'exported declaration', source: 'export let a = 1;\n' },
    {
      name: 'classic for-loop declaration',
      source: 'for (let i = 0; i < 1; i += 1) {}\n',
    },
    { name: 'for-of declaration', source: 'for (let x of y) {}\n' },
    { name: 'for-in declaration', source: 'for (let k in o) {}\n' },
  ];

  for (const { name, source } of declarationCases) {
    it(`reports one diagnostic for a ${name}`, async () => {
      const result = await checkFixture(source);

      assertSingleNoLetDiagnostic(result);
    });
  }

  it('does not report let text inside a value', async () => {
    const result = await checkFixture("const letter = 'let{it}=be';\n");

    assert.equal(result.exitCode, 0);
    assert.equal(result.diagnostics.length, 0);
  });

  it('honors a biome-ignore suppression with a reason', async () => {
    const result = await checkFixture(
      '// biome-ignore lint/plugin/noLet: state is intentionally reassigned\nlet count = 0;\ncount += 1;\n'
    );

    assert.equal(result.exitCode, 0);
    assert.equal(result.diagnostics.length, 0);
  });
});

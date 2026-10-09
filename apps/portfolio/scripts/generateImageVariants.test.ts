// @vitest-environment node
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import sharp from 'sharp';
import { describe, expect, it, onTestFinished } from 'vitest';

const scriptPath = fileURLToPath(
  new URL('./generateImageVariants.mjs', import.meta.url)
);

async function createJpeg(directory: string, filename: string, width: number) {
  await sharp({
    create: { width, height: 8, channels: 3, background: '#808080' },
  })
    .jpeg()
    .toFile(path.join(directory, filename));
}

describe('generateImageVariants', () => {
  it('emits AVIF variants up to each source width, capped at 1920, skipping the Open Graph image', async () => {
    const imageDirectory = await mkdtemp(
      path.join(tmpdir(), 'image-variants-')
    );
    onTestFinished(() => rm(imageDirectory, { recursive: true, force: true }));
    await createJpeg(imageDirectory, 'photo.jpg', 640);
    await createJpeg(imageDirectory, 'pattern.jpg', 1440);
    await createJpeg(imageDirectory, 'wide.jpg', 2400);
    await createJpeg(imageDirectory, 'hero-og.jpg', 1200);

    await promisify(execFile)(process.execPath, [scriptPath, imageDirectory]);

    const generatedFilenames = await readdir(
      path.join(imageDirectory, 'generated')
    );
    expect(generatedFilenames.sort()).toEqual([
      'pattern-w1080.avif',
      'pattern-w1440.avif',
      'pattern-w640.avif',
      'photo-w640.avif',
      'wide-w1080.avif',
      'wide-w1920.avif',
      'wide-w640.avif',
    ]);
  });
});

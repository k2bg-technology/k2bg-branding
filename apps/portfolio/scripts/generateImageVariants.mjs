import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const VARIANT_WIDTHS = [640, 1080, 1920];

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(scriptDirectory, '..');
const imageDirectory = path.join(appDirectory, 'public', 'images');
const outputDirectory = path.join(imageDirectory, 'generated');

async function isOutputCurrent(inputPath, outputPath) {
  try {
    const [inputStat, outputStat] = await Promise.all([
      stat(inputPath),
      stat(outputPath),
    ]);

    return outputStat.mtimeMs >= inputStat.mtimeMs;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function getVariantWidths(sourceWidth) {
  const cappedSourceWidth = Math.min(sourceWidth, 1920);
  const widths = VARIANT_WIDTHS.filter((width) => width <= sourceWidth);

  return [...new Set([...widths, cappedSourceWidth])].sort((a, b) => a - b);
}

async function generateVariant(inputPath, outputPath, width) {
  if (await isOutputCurrent(inputPath, outputPath)) {
    return;
  }

  await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .avif({ quality: 75 })
    .toFile(outputPath);
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  const filenames = await readdir(imageDirectory);
  const imageFilenames = filenames.filter(
    (filename) => filename.endsWith('.jpg') && filename !== 'hero-og.jpg',
  );

  await Promise.all(
    imageFilenames.map(async (filename) => {
      const inputPath = path.join(imageDirectory, filename);
      const metadata = await sharp(inputPath).metadata();

      if (!metadata.width) {
        throw new Error(`Could not read image width: ${inputPath}`);
      }

      const basename = path.basename(filename, '.jpg');
      const widths = getVariantWidths(metadata.width);

      await Promise.all(
        widths.map((width) =>
          generateVariant(
            inputPath,
            path.join(outputDirectory, `${basename}-w${width}.avif`),
            width,
          ),
        ),
      );
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import fs from 'fs';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';

// The path of the directory to save the image
const dirPath = `${process.cwd()}/public/images`;

export async function getImageWithPlaceholder(fileName: string) {
  const buffer = await fs.promises.readFile(path.join(dirPath, fileName));

  const plaiceholder = await getPlaiceholder(buffer, { size: 10 });

  return plaiceholder;
}

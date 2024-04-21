import fs from 'fs';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';

export async function getImageWithPlaceholder(fileName: string) {
  const dirPath = path.resolve('./public', 'images');

  const buffer = await fs.promises.readFile(path.join(dirPath, fileName));

  const plaiceholder = await getPlaiceholder(buffer, { size: 10 });

  return plaiceholder;
}

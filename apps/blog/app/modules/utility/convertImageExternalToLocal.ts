import fs from 'fs';
import path from 'path';

export async function convertImageExternalToLocal(
  imageUrl: string,
  fileName: string
) {
  const dirPath = path.resolve('./public', 'images');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(path.join(dirPath, fileName))) {
    const buffer = await fetch(imageUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        return Buffer.from(arrayBuffer);
      })
      .catch((error) => {
        throw new Error(error?.message);
      });

    await fs.promises.writeFile(path.join(dirPath, fileName), buffer);
  }
}

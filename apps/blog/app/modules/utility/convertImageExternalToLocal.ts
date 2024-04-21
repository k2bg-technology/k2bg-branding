import fs from 'fs';
import path from 'path';

// The path of the directory to save the image
const dirPath = `${process.cwd()}/public/images`;

export async function convertImageExternalToLocal(
  imageUrl: string,
  fileName: string
) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
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

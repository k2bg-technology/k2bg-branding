import fs from 'fs';
import path from 'path';

// The path of the directory to save the image
const dirPath = './public';

export async function convertImageExternalToLocal(
  imageUrl: string,
  fileName: string
) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  if (!fs.existsSync(path.join(dirPath, fileName))) {
    fetch(imageUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFile(path.join(dirPath, fileName), buffer, (error) => {
          if (error) {
            throw new Error(error.message);
          }
        });
      })
      .catch((error) => {
        throw new Error(error?.message);
      });
  }
}

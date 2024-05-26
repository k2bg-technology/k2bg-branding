import { getPlaiceholder } from 'plaiceholder';

export async function getImageWithPlaceholder(fileUrl: string) {
  const buffer = await fetch(fileUrl).then(async (res) =>
    Buffer.from(await res.arrayBuffer())
  );

  const plaiceholder = await getPlaiceholder(buffer, { size: 10 });

  return plaiceholder.base64;
}

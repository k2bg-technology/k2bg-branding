import path from 'path';

export function getExtensionFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const { pathname } = parsedUrl;
  const extension = path.parse(pathname).ext;

  return extension;
}

import fs, { type PathOrFileDescriptor } from 'fs';

import handlebars from 'handlebars';

export function generateHtmlTemplate(
  filePath: PathOrFileDescriptor,
  templateContext: Record<string, unknown>
): string {
  const file = fs.readFileSync(filePath, 'utf-8');
  const template = handlebars.compile(file);

  return template(templateContext);
}

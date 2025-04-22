import fs, { PathOrFileDescriptor } from 'fs';
import path from 'path';

import handlebars from 'handlebars';

export function generateHtmlTemplate(
  /** Path to the HTML template file */
  filePath: PathOrFileDescriptor,
  /** Data to inject into the template as key-value pairs */
  templateContext: Record<string, unknown>
) {
  const file = fs.readFileSync(
    path.join(process.cwd(), String(filePath)),
    'utf-8'
  );
  const template = handlebars.compile(file);

  return template(templateContext);
}

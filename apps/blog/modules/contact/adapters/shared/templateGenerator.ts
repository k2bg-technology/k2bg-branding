import fs, { type PathOrFileDescriptor } from 'fs';

import handlebars from 'handlebars';

/**
 * Template Generator
 *
 * Generates HTML content from Handlebars template files.
 */
export function generateHtmlTemplate(
  /** Path to the HTML template file */
  filePath: PathOrFileDescriptor,
  /** Data to inject into the template as key-value pairs */
  templateContext: Record<string, unknown>
): string {
  const file = fs.readFileSync(filePath, 'utf-8');
  const template = handlebars.compile(file);

  return template(templateContext);
}

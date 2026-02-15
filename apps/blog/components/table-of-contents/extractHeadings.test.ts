import { describe, expect, it } from 'vitest';

import { extractHeadings } from './extractHeadings';

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings from markdown', () => {
    const markdown = [
      '## Introduction',
      'Some text here.',
      '### Sub Section',
      'More text.',
      '## Conclusion',
    ].join('\n');

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'introduction', text: 'Introduction', level: 2 },
      { id: 'sub-section', text: 'Sub Section', level: 3 },
      { id: 'conclusion', text: 'Conclusion', level: 2 },
    ]);
  });

  it('ignores h1 and h4+ headings', () => {
    const markdown = [
      '# Title',
      '## Visible',
      '#### Deep Heading',
      '##### Deeper',
    ].join('\n');

    const result = extractHeadings(markdown);

    expect(result).toEqual([{ id: 'visible', text: 'Visible', level: 2 }]);
  });

  it('strips bold formatting from heading text', () => {
    const markdown = '## **Bold Heading**';

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'bold-heading', text: 'Bold Heading', level: 2 },
    ]);
  });

  it('strips italic formatting from heading text', () => {
    const markdown = '## *Italic Heading*';

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'italic-heading', text: 'Italic Heading', level: 2 },
    ]);
  });

  it('strips inline code from heading text', () => {
    const markdown = '## Using `useState` Hook';

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'using-usestate-hook', text: 'Using useState Hook', level: 2 },
    ]);
  });

  it('strips link formatting from heading text', () => {
    const markdown = '## Check [this link](https://example.com)';

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'check-this-link', text: 'Check this link', level: 2 },
    ]);
  });

  it('returns empty array for markdown with no headings', () => {
    const markdown = 'Just some paragraph text.\nMore text here.';

    const result = extractHeadings(markdown);

    expect(result).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    const result = extractHeadings('');

    expect(result).toEqual([]);
  });

  it('generates unique slugs for duplicate headings', () => {
    const markdown = ['## Section', '## Section', '## Section'].join('\n');

    const result = extractHeadings(markdown);

    expect(result).toEqual([
      { id: 'section', text: 'Section', level: 2 },
      { id: 'section-1', text: 'Section', level: 2 },
      { id: 'section-2', text: 'Section', level: 2 },
    ]);
  });
});

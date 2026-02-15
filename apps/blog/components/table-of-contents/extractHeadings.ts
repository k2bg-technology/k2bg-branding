import GithubSlugger from 'github-slugger';

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

const HEADING_REGEX = /^(#{2,3})\s+(.+)$/gm;

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

export function extractHeadings(markdown: string): TocHeading[] {
  const slugger = new GithubSlugger();

  return Array.from(markdown.matchAll(HEADING_REGEX), (match) => {
    // HEADING_REGEX captures exactly 2 or 3 '#' chars via {2,3}, so length is always 2 or 3.
    const level = match[1].length as 2 | 3;
    const text = stripMarkdownFormatting(match[2]);
    const id = slugger.slug(text);

    return { id, text, level };
  });
}

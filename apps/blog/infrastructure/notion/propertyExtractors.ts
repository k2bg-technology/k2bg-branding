import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { format } from 'date-fns';

export type NotionProperties = PageObjectResponse['properties'];

/**
 * Extracts title text from a Notion title property.
 * @returns The concatenated plain text from title blocks, or null if empty
 */
export function getTitle(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'title') {
    const text = prop.title.map((t) => t.plain_text).join('');
    return text || null;
  }
  return null;
}

/**
 * Extracts rich text from a Notion rich_text property.
 * @returns The concatenated plain text, or null if empty
 */
export function getRichText(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'rich_text') {
    const text = prop.rich_text.map((t) => t.plain_text).join('');
    return text || null;
  }
  return null;
}

/**
 * Extracts URL from a Notion url property.
 * @returns The URL string or null
 */
export function getUrl(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'url') {
    return prop.url;
  }
  return null;
}

/**
 * Extracts selected option name from a Notion select property.
 * @returns The selected option name or null
 */
export function getSelect(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'select') {
    return prop.select?.name ?? null;
  }
  return null;
}

/**
 * Extracts status name from a Notion status property.
 * @returns The status name or null
 */
export function getStatus(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'status') {
    return prop.status?.name ?? null;
  }
  return null;
}

/**
 * Extracts number from a Notion number property.
 * @returns The number value or null
 */
export function getNumber(
  props: NotionProperties,
  propName: string
): number | null {
  const prop = props[propName];
  if (prop?.type === 'number') {
    return prop.number;
  }
  return null;
}

/**
 * Extracts formatted date from a Notion date property.
 * @returns The formatted date string (yyyy-MM-dd) or null
 */
export function getDate(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'date' && prop.date?.start) {
    return format(new Date(prop.date.start), 'yyyy-MM-dd');
  }
  return null;
}

/**
 * Extracts the first file URL from a Notion files property.
 * @returns The first file URL or null
 */
export function getFirstFileUrl(
  props: NotionProperties,
  propName: string
): string | null {
  const prop = props[propName];
  if (prop?.type === 'files' && prop.files.length > 0) {
    const file = prop.files[0];
    if (file.type === 'file') {
      return file.file.url;
    }
    if (file.type === 'external') {
      return file.external.url;
    }
  }
  return null;
}

/**
 * Extracts all file URLs from a Notion files property.
 * @returns Array of file URLs or null if empty
 */
export function getAllFileUrls(
  props: NotionProperties,
  propName: string
): string[] | null {
  const prop = props[propName];
  if (prop?.type === 'files' && prop.files.length > 0) {
    return prop.files
      .map((file) => {
        if (file.type === 'file') return file.file.url;
        if (file.type === 'external') return file.external.url;
        return null;
      })
      .filter((url): url is string => url !== null);
  }
  return null;
}

/**
 * Extracts relation IDs from a Notion relation property.
 * @returns Array of related page IDs
 */
export function getRelations(
  props: NotionProperties,
  propName: string
): string[] {
  const prop = props[propName];
  if (prop?.type === 'relation') {
    return prop.relation.map((rel) => rel.id);
  }
  return [];
}

/**
 * Extracts multi-select option names from a Notion multi_select property.
 * @returns Array of selected option names
 */
export function getMultiSelect(
  props: NotionProperties,
  propName: string
): string[] {
  const prop = props[propName];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((item) => item.name);
  }
  return [];
}

export interface PersonData {
  id: string;
  name?: string;
  avatarUrl?: string;
}

/**
 * Extracts person data from a Notion people property.
 * @returns Person data object or null
 */
export function getPerson(
  props: NotionProperties,
  propName: string
): PersonData | null {
  const prop = props[propName];
  if (prop?.type === 'people' && prop.people.length > 0) {
    const person = prop.people[0];
    const hasFullData = 'name' in person;
    return {
      id: person.id,
      name: hasFullData
        ? ((person as { name: string | null }).name ?? undefined)
        : undefined,
      avatarUrl: hasFullData
        ? ((person as { avatar_url: string | null }).avatar_url ?? undefined)
        : undefined,
    };
  }
  return null;
}

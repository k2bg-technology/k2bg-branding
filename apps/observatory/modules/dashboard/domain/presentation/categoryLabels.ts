import { DuplicateCategoryLabelError } from '../errors';
import type { CategoryItem } from './categoryValue';

export function categoryLabels(
  items: CategoryItem[],
  remainderLabel: string | null,
  labels: { nullCategory: string },
  context: { sectionId: string }
): string[] {
  if (items.some((item) => item.category === labels.nullCategory)) {
    throw new DuplicateCategoryLabelError(
      context.sectionId,
      labels.nullCategory
    );
  }
  const names = items.map((item) => item.category ?? labels.nullCategory);
  if (remainderLabel !== null) names.push(remainderLabel);
  const duplicate = names.find((name, index) => names.indexOf(name) !== index);
  if (duplicate !== undefined) {
    throw new DuplicateCategoryLabelError(context.sectionId, duplicate);
  }
  return names;
}

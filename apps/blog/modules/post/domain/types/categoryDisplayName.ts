import { Category } from './enums';

export const CATEGORY_DISPLAY_NAMES: Record<Category, string> = {
  [Category.ENGINEERING]: 'Engineering',
  [Category.DESIGN]: 'Design',
  [Category.DATA_SCIENCE]: 'Data Science',
  [Category.LIFE_STYLE]: 'Life Style',
  [Category.OTHER]: 'Other',
};

export function getCategoryDisplayName(category: Category): string {
  return CATEGORY_DISPLAY_NAMES[category];
}

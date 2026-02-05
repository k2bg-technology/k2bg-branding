import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

export function Description() {
  const { story } = useOf('story', ['story']);
  const { description } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  if (!description) {
    return null;
  }

  return <p>{t(description.component)}</p>;
}

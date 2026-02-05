import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

export function Overview() {
  const { story } = useOf('story', ['story']);
  const { overview } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  if (!overview) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Overview</h2>
      <p>{t(overview)}</p>
    </section>
  );
}

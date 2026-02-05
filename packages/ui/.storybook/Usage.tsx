import { Source, useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

export function Usage() {
  const { story } = useOf('story', ['story']);
  const { usage } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Usage/Guidelines</h2>
      {usage && <p>{t(usage)}</p>}
      <Source />
    </section>
  );
}

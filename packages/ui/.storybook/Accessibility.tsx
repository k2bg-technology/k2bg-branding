import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

export default function Accessibility() {
  const { story } = useOf('story', ['story']);
  const { accessibility } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  if (!accessibility) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Accessibility</h2>
      <p>{t(accessibility)}</p>
    </section>
  );
}

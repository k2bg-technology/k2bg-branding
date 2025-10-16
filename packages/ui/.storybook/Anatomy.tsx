import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

export default function Anatomy() {
  const { story } = useOf('story', ['story']);
  const { anatomy } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  if (!anatomy) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Anatomy/Composition</h2>
      <p>{t(anatomy)}</p>
    </section>
  );
}

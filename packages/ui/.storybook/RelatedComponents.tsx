import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';
import { Icon } from '../src/components/Icon';

export default function RelatedComponents() {
  const { story } = useOf('story', ['story']);
  const storyDocs = story?.parameters?.docs || {};
  const { t } = useTranslation();

  const relatedComponents = t(storyDocs.relatedComponents, {
    returnObjects: true,
    defaultValue: [],
  });

  if (!Array.isArray(relatedComponents) || relatedComponents.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Related Components</h2>
      <ul className="flex gap-normal flex-col">
        {relatedComponents.map((component, index) => (
          <li key={index}>
            <span className="flex items-center gap-condensed">
              <Icon name="arrow-right" width={14} height={14} />
              <a
                href={component.path}
                className="text-base-black/80 underline hover:opacity-80"
              >
                {component.name}
              </a>
            </span>
            <p>{component.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

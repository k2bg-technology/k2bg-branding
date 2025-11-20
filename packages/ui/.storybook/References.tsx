import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';
import { Icon } from '../src/components/Icon';

export default function References() {
  const { story } = useOf('story', ['story']);
  const storyDocs = story?.parameters?.docs || {};
  const { t } = useTranslation();

  const references = t(storyDocs.references, {
    returnObjects: true,
    defaultValue: [],
  });

  if (!Array.isArray(references)) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>References</h2>
      <ul className="flex gap-normal flex-col">
        {references.map((item, index) => {
          const isExternal = /^https?:\/\//.test(item.url);

          return (
            <li key={index}>
              {isExternal ? (
                <span className="flex items-center gap-condensed">
                  <Icon
                    name="arrow-top-right-on-square"
                    width={14}
                    height={14}
                  />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base-black/80 underline hover:opacity-80"
                  >
                    {item.linkText}
                  </a>
                </span>
              ) : (
                <a
                  href={item.url}
                  className="text-base-black/80 underline hover:opacity-80"
                >
                  {item.linkText}
                </a>
              )}
              <p>{item.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';
import { Badge } from '../src/components/Badge';
import { Icon } from '../src/components/Icon';

export function DoDont() {
  const { story } = useOf('story', ['story']);
  const { doList, dontList } = story?.parameters?.docs || {};
  const { t } = useTranslation();

  const doItems = t(doList, { returnObjects: true, defaultValue: [] });
  const dontItems = t(dontList, { returnObjects: true, defaultValue: [] });

  if (!Array.isArray(doItems) || !Array.isArray(dontItems)) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Do/Don't</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-normal">
          <Badge color="success">Do</Badge>
          <ul className="list-disc list-inside flex gap-condensed flex-col">
            {doItems.map((item, index) => (
              <li key={index} className="flex gap-condensed">
                <Icon
                  name="check-circle"
                  appearance="solid"
                  width={16}
                  height={16}
                  color="var(--color-success)"
                  className="py-3 flex-shrink-0"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-normal">
          <Badge color="error">Don't</Badge>
          <ul className="list-disc list-inside flex gap-condensed flex-col">
            {dontItems.map((item, index) => (
              <li key={index} className="flex gap-condensed">
                <Icon
                  name="x-circle"
                  appearance="solid"
                  width={16}
                  height={16}
                  color="var(--color-error)"
                  className="py-3 flex-shrink-0"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

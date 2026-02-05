import { useOf } from '@storybook/addon-docs/blocks';
import { useTranslation } from 'react-i18next';

interface Dependency {
  package: string;
  version: string;
  reason: string;
}

export function Dependencies() {
  const { story } = useOf('story', ['story']);
  const storyDocs = story?.parameters?.docs || {};
  const { t } = useTranslation();

  const dependencies = t(storyDocs.dependencies, {
    returnObjects: true,
    defaultValue: [],
  }) satisfies Dependency[];

  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>Dependencies</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-base-black/10">
              <th className="text-left py-2 px-3 text-sm">Package</th>
              <th className="text-left py-2 px-3 text-sm">Version</th>
              <th className="text-left py-2 px-3 text-sm">Reason</th>
            </tr>
          </thead>
          <tbody>
            {dependencies.map((dep) => (
              <tr
                key={dep.package}
                className="border-b border-base-black/5 hover:bg-base-black/5"
              >
                <td className="py-2 px-3 text-sm font-mono">{dep.package}</td>
                <td className="py-2 px-3 text-sm font-mono text-base-black/70">
                  {dep.version}
                </td>
                <td className="py-2 px-3 text-sm text-base-black/80">
                  {dep.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Card } from 'ui';

import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type { DefinitionSourceResult } from '../../modules/dashboard/use-cases';

interface Props {
  loadDashboards: () => Promise<DefinitionSourceResult>;
}

export async function DashboardIndex({ loadDashboards }: Props) {
  try {
    const { definitions, issues } = await loadDashboards();

    return (
      <>
        {definitions.length === 0 ? (
          <p className="text-body-r-md">No dashboard definitions were found.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            {definitions.map((definition) => (
              <li key={definition.id}>
                <Card className="relative h-full hover:border-base-default/30 hover:shadow-sm">
                  <Card.Header>
                    <Card.Title>
                      <Link
                        href={`/dashboards/${definition.id}`}
                        className="after:absolute after:inset-0 after:rounded-xl"
                      >
                        {definition.title}
                      </Link>
                    </Card.Title>
                    {definition.description && (
                      <Card.Description>
                        {definition.description}
                      </Card.Description>
                    )}
                  </Card.Header>
                </Card>
              </li>
            ))}
          </ul>
        )}
        {issues.length > 0 && (
          <section className="flex flex-col gap-normal">
            <h2 className="text-heading-3">Definition issues</h2>
            <ul className="flex flex-col gap-condensed">
              {issues.map((issue) => (
                <li
                  key={`${issue.fileName}:${issue.path}:${issue.message}`}
                  className="text-body-r-sm"
                >
                  {issue.fileName} — {issue.path ? `${issue.path} — ` : ''}
                  {issue.message}
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  } catch (error) {
    dashboardLogger.error({ err: error }, 'Failed to load dashboards');
    return (
      <section
        role="alert"
        className="flex flex-col gap-condensed rounded-lg border border-accent-default/50 bg-accent-light/15 p-4"
      >
        <h2 className="text-heading-5">Dashboards unavailable</h2>
        <p className="text-body-r-sm">
          Dashboard definitions could not be loaded. Check the server logs.
        </p>
      </section>
    );
  }
}

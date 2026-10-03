import Link from 'next/link';

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
          <ul className="flex flex-col gap-normal">
            {definitions.map((definition) => (
              <li key={definition.id} className="flex flex-col gap-condensed">
                <Link
                  href={`/dashboards/${definition.id}`}
                  className="text-body-b-md underline-offset-4 hover:underline"
                >
                  {definition.title}
                </Link>
                {definition.description && (
                  <p className="text-body-r-sm">{definition.description}</p>
                )}
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
        className="flex flex-col gap-condensed rounded-md border border-accent-default bg-base-light p-normal"
      >
        <h2 className="text-heading-5">Dashboards unavailable</h2>
        <p className="text-body-r-sm">
          Dashboard definitions could not be loaded. Check the server logs.
        </p>
      </section>
    );
  }
}

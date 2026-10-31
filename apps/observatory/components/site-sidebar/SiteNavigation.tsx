import { Suspense } from 'react';

import { CurrentSiteNavigation } from './CurrentSiteNavigation';
import {
  type NavigationLink,
  SiteNavigationLinks,
} from './SiteNavigationLinks';

export type { NavigationLink } from './SiteNavigationLinks';

interface Props {
  links: NavigationLink[];
}

export function SiteNavigation({ links }: Props) {
  return (
    <Suspense fallback={<SiteNavigationLinks links={links} />}>
      <CurrentSiteNavigation links={links} />
    </Suspense>
  );
}

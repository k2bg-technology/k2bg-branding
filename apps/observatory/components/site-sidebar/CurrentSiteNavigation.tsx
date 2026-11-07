'use client';

import { usePathname } from 'next/navigation';

import {
  type NavigationLink,
  SiteNavigationLinks,
} from './SiteNavigationLinks';

interface Props {
  links: NavigationLink[];
}

// Only active-link state waits for the pathname; navigation links remain visible.
export function CurrentSiteNavigation({ links }: Props) {
  const pathname = usePathname();
  return <SiteNavigationLinks links={links} pathname={pathname} />;
}

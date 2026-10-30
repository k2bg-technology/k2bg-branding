'use client';

import Link from 'next/link';
import { Fragment } from 'react';

export interface NavigationLink {
  href: string;
  label: string;
}

interface Props {
  links: NavigationLink[];
  pathname?: string | null;
}

export function SiteNavigationLinks({ links, pathname }: Props) {
  return (
    <nav aria-label="Observatory">
      <ul className="flex flex-col gap-1">
        {links.map((link, index) => (
          <Fragment key={link.href}>
            {link.href.startsWith('/dashboards/') &&
              !links[index - 1]?.href.startsWith('/dashboards/') && (
                <li className="px-3 pt-4 pb-2 text-caption text-base-black/80">
                  Dashboards
                </li>
              )}
            <li>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className="flex rounded-md px-3 py-2 text-body-r-sm focus-visible:-outline-offset-2 text-base-black/80 hover:bg-base-light/50 aria-[current=page]:bg-base-light/70 aria-[current=page]:font-semibold aria-[current=page]:text-base-black"
              >
                {link.label}
              </Link>
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  );
}

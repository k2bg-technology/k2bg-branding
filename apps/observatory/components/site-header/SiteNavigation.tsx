'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavigationLink {
  href: string;
  label: string;
}

interface Props {
  links: NavigationLink[];
}

export function SiteNavigation({ links }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Observatory">
      <ul className="flex flex-wrap items-center gap-spacious">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className="text-body-r-sm text-base-black/80 underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-base-black"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

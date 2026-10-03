import { type NavigationLink, SiteNavigation } from './SiteNavigation';

interface Props {
  links: NavigationLink[];
}

export function SiteHeader({ links }: Props) {
  return (
    <header className="flex flex-col gap-normal border-base-default/20 border-b bg-base-white px-spacious py-normal text-base-black">
      <span className="text-heading-5">Observatory</span>
      <SiteNavigation links={links} />
    </header>
  );
}

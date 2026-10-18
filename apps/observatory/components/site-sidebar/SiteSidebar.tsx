import { Button, Drawer, Icon, ScrollArea } from 'ui';

import { type NavigationLink, SiteNavigation } from './SiteNavigation';

interface Props {
  links: NavigationLink[];
}

export function SiteSidebar({ links }: Props) {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-base-default/15 bg-white text-base-black lg:flex">
        <span className="px-6 py-5 text-heading-5 font-semibold">
          Observatory
        </span>
        <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
          <SiteNavigation links={links} />
        </ScrollArea>
      </aside>
      <header className="flex items-center justify-between border-b border-base-default/20 bg-white px-4 py-2 text-base-black lg:hidden">
        <span className="text-heading-5 font-semibold">Observatory</span>
        <Drawer
          trigger={
            <Button
              type="button"
              variant="ghost"
              color="dark"
              size="icon"
              className="rounded-md"
              aria-label="Open navigation"
            >
              <Icon name="bars-3" />
            </Button>
          }
          title="Observatory"
          mainContent={
            <div className="w-56">
              <SiteNavigation links={links} />
            </div>
          }
        />
      </header>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button, Icon, Popover, ScrollArea } from 'ui';
import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';
import type { TocHeading } from './extractHeadings';
import { useActiveHeading } from './useActiveHeading';

interface Props {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = usePageScrollAreaStore(
    (state) => state.scrollContainerRef
  );

  const activeId = useActiveHeading(headings);

  useEffect(() => {
    setIsOpen(window.matchMedia('(min-width: 768px)').matches);
  }, []);

  if (headings.length === 0) return null;

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (!element || !scrollContainerRef?.current) return;

    const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
    const elementTop = element.getBoundingClientRect().top - containerTop;
    const scrollTop = scrollContainerRef.current.scrollTop + elementTop;

    scrollContainerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={
          <Button
            size="icon"
            color="dark"
            aria-label={isOpen ? '目次を閉じる' : '目次を開く'}
            aria-expanded={isOpen}
          >
            <Icon
              name={isOpen ? 'x-mark' : 'list-bullet'}
              color="var(--color-white)"
            />
          </Button>
        }
      />
      <Popover.Positioner side="top" align="end">
        <Popover.Popup color="dark">
          <nav aria-label="目次">
            <ScrollArea className="w-72 max-h-[500px]">
              <ul className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <button
                      type="button"
                      onClick={() => handleHeadingClick(heading.id)}
                      className={`w-full text-left text-sm leading-relaxed py-1 transition-colors hover:text-white ${
                        heading.level === 3 ? 'pl-4' : ''
                      } ${
                        activeId === heading.id
                          ? 'text-white font-bold'
                          : 'text-white/60'
                      }`}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </nav>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover>
  );
}

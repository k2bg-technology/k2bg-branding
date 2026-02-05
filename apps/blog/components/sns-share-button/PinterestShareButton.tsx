'use client';

import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function PinterestShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <Button variant="ghost" color="dark" size="icon" type="button" asChild>
      <a
        href={`https://pinterest.com/pin/create/button/?url=${fullUrl}&description=${title}`}
        target="_blank"
        rel="noreferrer"
        aria-label="pinterest"
      >
        <Icon name="pinterest" originalColor width={20} height={20} />
      </a>
    </Button>
  );
}

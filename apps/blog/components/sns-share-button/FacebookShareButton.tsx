'use client';

import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function FacebookShareButton() {
  const { fullUrl } = useSnsShareInfo();

  return (
    <Button variant="ghost" color="dark" size="icon" type="button" asChild>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="facebook"
      >
        <Icon name="facebook" originalColor width={20} height={20} />
      </a>
    </Button>
  );
}

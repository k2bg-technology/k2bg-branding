'use client';

import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export default function XShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <Button variant="ghost" color="dark" size="icon" type="button" asChild>
      <a
        href={`https://twitter.com/share?url=${fullUrl}&text=${title}`}
        target="_blank"
        rel="noreferrer"
        aria-label="x"
      >
        <Icon name="x" originalColor width={20} height={20} />
      </a>
    </Button>
  );
}

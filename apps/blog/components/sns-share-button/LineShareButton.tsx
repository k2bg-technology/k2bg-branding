'use client';

import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export default function LineShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <Button variant="ghost" color="dark" size="icon" type="button" asChild>
      <a
        href={`http://line.me/R/msg/text/?${title}%0D%0A${fullUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="line"
      >
        <Icon name="line" originalColor width={20} height={20} />
      </a>
    </Button>
  );
}

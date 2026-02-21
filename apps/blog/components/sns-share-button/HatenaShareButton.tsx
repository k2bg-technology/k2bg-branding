'use client';

import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function HatenaShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <Button variant="ghost" color="dark" size="icon" type="button" asChild>
      <a
        href={`https://b.hatena.ne.jp/add?mode=confirm&url=${fullUrl}&title=${title}`}
        target="_blank"
        rel="noreferrer"
        aria-label="hatena"
      >
        <Icon name="hatena" originalColor width={20} height={20} />
      </a>
    </Button>
  );
}

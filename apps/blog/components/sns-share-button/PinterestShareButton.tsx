'use client';

import { buttonVariants, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function PinterestShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <a
      href={`https://pinterest.com/pin/create/button/?url=${fullUrl}&description=${title}`}
      target="_blank"
      rel="noreferrer"
      aria-label="pinterest"
      className={buttonVariants({
        variant: 'ghost',
        color: 'dark',
        size: 'icon',
      })}
    >
      <Icon name="pinterest" originalColor width={20} height={20} />
    </a>
  );
}

'use client';

import { buttonVariants, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function XShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <a
      href={`https://twitter.com/share?url=${fullUrl}&text=${title}`}
      target="_blank"
      rel="noreferrer"
      aria-label="x"
      className={buttonVariants({
        variant: 'ghost',
        color: 'dark',
        size: 'icon',
      })}
    >
      <Icon name="x" originalColor width={20} height={20} />
    </a>
  );
}

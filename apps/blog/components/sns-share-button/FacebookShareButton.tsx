'use client';

import { buttonVariants, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function FacebookShareButton() {
  const { fullUrl } = useSnsShareInfo();

  return (
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`}
      target="_blank"
      rel="noreferrer"
      aria-label="facebook"
      className={buttonVariants({
        variant: 'ghost',
        color: 'dark',
        size: 'icon',
      })}
    >
      <Icon name="facebook" originalColor width={20} height={20} />
    </a>
  );
}

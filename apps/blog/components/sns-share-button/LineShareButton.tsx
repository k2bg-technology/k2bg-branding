'use client';

import { buttonVariants, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

export function LineShareButton() {
  const { title, fullUrl } = useSnsShareInfo();

  return (
    <a
      href={`https://line.me/R/msg/text/?${title}%0D%0A${fullUrl}`}
      target="_blank"
      rel="noreferrer"
      aria-label="line"
      className={buttonVariants({
        variant: 'ghost',
        color: 'dark',
        size: 'icon',
      })}
    >
      <Icon name="line" originalColor width={20} height={20} />
    </a>
  );
}

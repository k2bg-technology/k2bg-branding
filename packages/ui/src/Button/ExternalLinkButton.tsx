import { AnchorHTMLAttributes, PropsWithChildren } from 'react';

import { SvgIcon } from '../Icon';

import styles from './Button.module.css';

export default function ExternalLinkButton({
  children,
  className,
  ...rest
}: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <a {...rest} className={`${styles.Button} ${className}`}>
      {children}
      <SvgIcon
        name="arrow-top-right-on-square"
        className="inline-block ml-2 w-5 h-5"
      />
    </a>
  );
}

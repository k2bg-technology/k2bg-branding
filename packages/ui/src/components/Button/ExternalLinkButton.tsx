import { AnchorHTMLAttributes } from 'react';

import { Icon } from '../Icon';
import { Color, Variant } from '../../types/global';

import styles from './Button.module.css';

const STYLES = {
  inherit: {
    contained: styles.inheritContained,
    outlined: styles.inheritOutlined,
    text: styles.inheritText,
  },
  main: {
    contained: styles.mainContained,
    outlined: styles.mainOutlined,
    text: styles.mainText,
  },
  accent: {
    contained: styles.accentContained,
    outlined: styles.accentOutlined,
    text: styles.accentText,
  },
  success: {
    contained: styles.successContained,
    outlined: styles.successOutlined,
    text: styles.successText,
  },
  error: {
    contained: styles.errorContained,
    outlined: styles.errorOutlined,
    text: styles.errorText,
  },
  info: {
    contained: styles.infoContained,
    outlined: styles.infoOutlined,
    text: styles.infoText,
  },
  warning: {
    contained: styles.warningContained,
    outlined: styles.warningOutlined,
    text: styles.warningText,
  },
  dark: {
    contained: styles.darkContained,
    outlined: styles.darkOutlined,
    text: styles.darkText,
  },
  light: {
    contained: styles.lightContained,
    outlined: styles.lightOutlined,
    text: styles.lightText,
  },
} as const satisfies Record<Color, Record<Variant, string>>;

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  color?: Color;
  variant?: Variant;
}

export default function ExternalLinkButton({
  children,
  className,
  color = 'main',
  variant = 'contained',
  ...rest
}: Props) {
  return (
    <a
      {...rest}
      className={`${styles.button} ${STYLES[color][variant]} ${className}`}
    >
      <span>{children}</span>
      <Icon
        name="arrow-top-right-on-square"
        color="currentcolor"
        width={12.5}
        height={12.5}
        className="ml-2"
      />
    </a>
  );
}

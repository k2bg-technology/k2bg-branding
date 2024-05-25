import { ButtonHTMLAttributes } from 'react';

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

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  color?: Color;
  variant?: Variant;
}

export default function Button({
  children,
  className,
  color = 'main',
  variant = 'contained',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${styles.button} ${STYLES[color][variant]} ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}

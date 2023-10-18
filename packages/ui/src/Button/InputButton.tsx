import { InputHTMLAttributes } from 'react';

import { Color, Variant } from '../types/global';

import styles from './Button.module.css';

const STYLES = {
  inherit: {
    contained: styles.InheritContained,
    outlined: styles.InheritOutlined,
    text: styles.InheritText,
  },
  main: {
    contained: styles.MainContained,
    outlined: styles.MainOutlined,
    text: styles.MainText,
  },
  accent: {
    contained: styles.AccentContained,
    outlined: styles.AccentOutlined,
    text: styles.AccentText,
  },
  success: {
    contained: styles.SuccessContained,
    outlined: styles.SuccessOutlined,
    text: styles.SuccessText,
  },
  error: {
    contained: styles.ErrorContained,
    outlined: styles.ErrorOutlined,
    text: styles.ErrorText,
  },
  info: {
    contained: styles.InfoContained,
    outlined: styles.InfoOutlined,
    text: styles.InfoText,
  },
  warning: {
    contained: styles.WarningContained,
    outlined: styles.WarningOutlined,
    text: styles.WarningText,
  },
  dark: {
    contained: styles.DarkContained,
    outlined: styles.DarkOutlined,
    text: styles.DarkText,
  },
  light: {
    contained: styles.LightContained,
    outlined: styles.LightOutlined,
    text: styles.LightText,
  },
} as const satisfies Record<Color, Record<Variant, string>>;

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  color?: Color;
  variant?: Variant;
}

export default function InputButton({
  className,
  color = 'main',
  variant = 'contained',
  ...rest
}: Props) {
  return (
    <input
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      className={`${styles.Button} ${STYLES[color][variant]} ${className}`}
    />
  );
}

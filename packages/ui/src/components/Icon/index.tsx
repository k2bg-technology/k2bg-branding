'use client';

import { CSSProperties } from 'react';

import { ICON_NAMES } from './const';
import styles from './index.module.css';

const importAll = (r: __WebpackModuleApi.RequireContext) =>
  r
    .keys()
    .map((key) => [key, r(key)])
    .reduce(
      (prev, [key, image]) => ({
        ...prev,
        [key]: image,
      }),
      {} as Record<string, string>
    );

const multiColorIcons = importAll(
  require.context('./multi-color-icons', false, /\.(svg)$/)
);

const heroOutlineIcons = importAll(
  require.context('./hero-icons/outline', false, /\.(svg)$/)
);

const heroSolidIcons = importAll(
  require.context('./hero-icons/solid', false, /\.(svg)$/)
);

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: (typeof ICON_NAMES)[number];
  appearance?: 'outline' | 'solid';
  color?: CSSProperties['backgroundColor'];
  width?: number;
  height?: number;
  originalColor?: boolean;
}

export function Icon(props: IconProps) {
  const {
    name,
    appearance = 'outline',
    originalColor = false,
    color = 'var(--color-base-black)',
    width = 24,
    height = 24,
    className,
    ...rest
  } = props;

  const iconUrl = {
    ...multiColorIcons,
    ...(appearance === 'outline' ? heroOutlineIcons : heroSolidIcons),
  }[`./${name}.svg`];

  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <i
      {...rest}
      className={`${styles.icon} ${
        originalColor && `${styles.originalColor}`
      } ${className}`}
      style={{
        '--image-url': `url(${iconUrl})`,
        '--icon-color': color,
        '--icon-width': width,
        '--icon-height': height,
      }}
    />
  );
}

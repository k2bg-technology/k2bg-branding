'use client';

import { type CSSProperties, memo } from 'react';

import type { ICON_NAMES } from './const';
import {
  heroOutlineIcons,
  heroSolidIcons,
  type IconUrl,
  multiColorIcons,
} from './iconUrls.generated';
import styles from './index.module.css';

// An imported SVG resolves to different shapes per bundler: a URL string
// (webpack asset/resource, esbuild dataurl), a StaticImageData `{ src }`
// (Next.js / Turbopack), or a module namespace `{ default: { src } }`.
function resolveIconSrc(value: IconUrl | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (value && 'src' in value) return value.src;
  return value?.default?.src;
}

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: (typeof ICON_NAMES)[number];
  appearance?: 'outline' | 'solid';
  color?: CSSProperties['backgroundColor'];
  width?: number;
  height?: number;
  originalColor?: boolean;
}

function IconInner(props: IconProps) {
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

  const heroIcons =
    appearance === 'outline' ? heroOutlineIcons : heroSolidIcons;
  const iconUrl = multiColorIcons[name] ?? heroIcons[name];
  // Quote the url() target: esbuild's dataurl loader inlines SVGs with raw
  // double-quotes/angle-brackets, which break an unquoted CSS url(). Single
  // quotes are safe — the inlined data URLs never contain single quotes.
  const iconSrc = resolveIconSrc(iconUrl);

  return (
    <i
      {...rest}
      className={`${styles.icon} ${originalColor ? styles.originalColor : ''} ${className ?? ''}`}
      style={
        {
          '--image-url': `url('${iconSrc}')`,
          '--icon-color': color,
          '--icon-width': width,
          '--icon-height': height,
        } as CSSProperties
      }
    />
  );
}

export const Icon = memo(IconInner);

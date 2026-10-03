const TONE_RGB = {
  dark: '0, 0, 0',
  // --color-base-black (#474a4d)
  brand: '71, 74, 77',
} as const;

export type OverlayPosition = 'top' | 'bottom' | 'full';
export type OverlayTone = keyof typeof TONE_RGB;

interface OverlayBackgroundInput {
  position: OverlayPosition;
  tone: OverlayTone;
  maxOpacity: number;
}

export function getOverlayBackground({
  position,
  tone,
  maxOpacity,
}: OverlayBackgroundInput): string {
  const rgb = TONE_RGB[tone];

  if (position === 'full') {
    return `rgba(${rgb}, ${maxOpacity})`;
  }

  const direction = position === 'bottom' ? 'to top' : 'to bottom';
  return `linear-gradient(${direction}, rgba(${rgb}, ${maxOpacity}), rgba(${rgb}, 0))`;
}

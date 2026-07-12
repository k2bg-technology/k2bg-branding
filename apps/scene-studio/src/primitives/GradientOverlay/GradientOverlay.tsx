import { cn } from '../../utils/cn';

const TONE_RGB = {
  dark: '0, 0, 0',
  // --color-base-black (#474a4d)
  brand: '71, 74, 77',
} as const;

interface Props {
  position?: 'top' | 'bottom' | 'full';
  tone?: keyof typeof TONE_RGB;
  maxOpacity?: number;
  className?: string;
}

export function GradientOverlay({
  position = 'bottom',
  tone = 'dark',
  maxOpacity = 0.6,
  className,
}: Props) {
  const rgb = TONE_RGB[tone];
  const background =
    position === 'full'
      ? `rgba(${rgb}, ${maxOpacity})`
      : `linear-gradient(to ${position === 'bottom' ? 'top' : 'bottom'}, rgba(${rgb}, ${maxOpacity}), rgba(${rgb}, 0))`;

  return (
    <div
      className={cn(
        'absolute inset-x-0',
        position === 'full' && 'inset-y-0',
        position === 'bottom' && 'bottom-0 h-2/5',
        position === 'top' && 'top-0 h-2/5',
        className
      )}
      style={{ background }}
    />
  );
}

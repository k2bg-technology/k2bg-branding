import { cn } from '../../utils/cn';
import {
  getOverlayBackground,
  type OverlayPosition,
  type OverlayTone,
} from './overlayBackground';

interface Props {
  position?: OverlayPosition;
  tone?: OverlayTone;
  maxOpacity?: number;
  className?: string;
}

export function GradientOverlay({
  position = 'bottom',
  tone = 'dark',
  maxOpacity = 0.6,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'absolute inset-x-0',
        position === 'full' && 'inset-y-0',
        position === 'bottom' && 'bottom-0 h-2/5',
        position === 'top' && 'top-0 h-2/5',
        className
      )}
      style={{
        background: getOverlayBackground({ position, tone, maxOpacity }),
      }}
    />
  );
}

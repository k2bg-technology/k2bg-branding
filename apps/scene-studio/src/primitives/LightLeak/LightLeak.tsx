import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import { getLightLeakMotion } from './lightLeakMotion';

interface Props {
  className?: string;
}

export function LightLeak({ className }: Props) {
  const frame = useCurrentFrame();
  const washes = getLightLeakMotion(frame);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
    >
      {washes.map((wash) => (
        <div
          key={wash.name}
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${wash.centerXInPercent}% ${wash.centerYInPercent}%, rgba(${wash.color.red}, ${wash.color.green}, ${wash.color.blue}, ${wash.opacity}) 0%, rgba(${wash.color.red}, ${wash.color.green}, ${wash.color.blue}, ${wash.opacity * 0.5}) ${wash.radiusInPercent * 0.5}%, transparent ${wash.radiusInPercent}%)`,
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </div>
  );
}

import { cn } from '../../utils/cn';
import { getEdgeBlurMask } from './edgeBlurMask';

const EDGES = ['top', 'bottom'] as const;

interface Props {
  blurInPx?: number;
  bandHeightInPercent?: number;
  className?: string;
}

// Miniature-style defocus: blurs what is already rendered underneath,
// so media never needs a second (expensive) decode.
export function EdgeBlur({
  blurInPx = 14,
  bandHeightInPercent = 22,
  className,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      {EDGES.map((edge) => (
        <div
          key={edge}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [edge]: 0,
            height: `${bandHeightInPercent}%`,
            backdropFilter: `blur(${blurInPx}px)`,
            WebkitBackdropFilter: `blur(${blurInPx}px)`,
            maskImage: getEdgeBlurMask(edge),
            WebkitMaskImage: getEdgeBlurMask(edge),
          }}
        />
      ))}
    </div>
  );
}

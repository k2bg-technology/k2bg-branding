import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import { getParticleState } from './particleMotion';

interface Props {
  count?: number;
  seed?: number;
  className?: string;
}

export function ParticleDrift({ count = 40, seed = 0, className }: Props) {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: count }, (_, particleIndex) => ({
    particleIndex,
    ...getParticleState({ particleIndex, frame, seed }),
  }));

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
    >
      {particles.map((particle) => (
        <div
          key={`particle-${particle.particleIndex}`}
          style={{
            position: 'absolute',
            left: `${particle.xInPercent}%`,
            top: `${particle.yInPercent}%`,
            width: particle.sizeInPx,
            height: particle.sizeInPx,
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            opacity: particle.opacity,
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </div>
  );
}

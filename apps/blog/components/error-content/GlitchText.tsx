'use client';

import { motion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'ui';

import styles from './GlitchText.module.css';

interface GlitchTextProps {
  children: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({
  children,
  className,
  intensity = 'medium',
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval =
      intensity === 'high' ? 4000 : intensity === 'medium' ? 6000 : 10000;
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 250);
    }, interval);
    return () => clearInterval(glitchInterval);
  }, [intensity]);

  const glitchVariants = {
    normal: { x: 0, skewX: 0 },
    glitch: {
      x: [0, -3, 3, -2, 2, 0],
      skewX: [0, -1, 1, -0.5, 0.5, 0],
      transition: { duration: 0.25, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    },
  };

  return (
    <div className={twMerge('relative inline-block', className)}>
      <motion.span
        className={twMerge(
          'relative z-10 block',
          isGlitching && styles.textShadow
        )}
        animate={isGlitching ? 'glitch' : 'normal'}
        variants={glitchVariants}
      >
        {children}
      </motion.span>

      <GhostLayer
        color="#ffffff"
        baseOpacity={0.4}
        glitchX={[-4, 5, -3, 4, -4]}
        isGlitching={isGlitching}
      >
        {children}
      </GhostLayer>

      <GhostLayer
        color="#000000"
        baseOpacity={0.3}
        glitchX={[4, -5, 3, -4, 4]}
        isGlitching={isGlitching}
      >
        {children}
      </GhostLayer>

      {isGlitching && (
        <>
          <motion.div
            className="absolute left-0 top-0 h-[2px] w-full bg-white opacity-60"
            initial={{ y: 0 }}
            animate={{
              y: [0, '500%', '250%', '600%', 0],
              scaleX: [1, 0.6, 1.4, 0.7, 1],
            }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="absolute left-0 top-0 h-[1px] w-full bg-black opacity-40"
            initial={{ y: '100%' }}
            animate={{
              y: ['100%', '0%', '400%', '200%', '100%'],
              scaleX: [1, 1.4, 0.6, 1.3, 1],
            }}
            transition={{ duration: 0.25 }}
          />
        </>
      )}
    </div>
  );
}

interface GhostLayerProps {
  children: ReactNode;
  color: string;
  baseOpacity: number;
  glitchX: number[];
  isGlitching: boolean;
}

function GhostLayer({
  children,
  color,
  baseOpacity,
  glitchX,
  isGlitching,
}: GhostLayerProps) {
  return (
    <motion.span
      className={twMerge(
        'pointer-events-none absolute left-0 top-0 block size-full select-none',
        styles.ghostLayer
      )}
      style={{ '--ghost-color': color }}
      initial={{ opacity: baseOpacity }}
      animate={
        isGlitching
          ? {
              x: glitchX,
              opacity: glitchX.map((_, i) =>
                i % 2 === 0 ? baseOpacity - 0.1 : baseOpacity + 0.1
              ),
            }
          : { x: 0, opacity: 0 }
      }
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.span>
  );
}

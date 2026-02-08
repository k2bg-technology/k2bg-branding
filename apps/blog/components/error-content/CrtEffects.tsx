'use client';

import { motion } from 'motion/react';
import { twMerge } from 'ui';

import styles from './CrtEffects.module.css';

interface OpacityProps {
  opacity?: number;
}

export function StaticNoise({ opacity = 0.05 }: OpacityProps) {
  return (
    <motion.div
      className={twMerge(
        'pointer-events-none fixed inset-0 z-40',
        styles.staticNoise
      )}
      aria-hidden="true"
      initial={{ opacity }}
      animate={{
        opacity: [
          opacity,
          opacity * 0.3,
          opacity * 1.8,
          opacity * 0.6,
          opacity,
        ],
        backgroundPosition: [
          '0% 0%',
          '100% 100%',
          '0% 100%',
          '100% 0%',
          '0% 0%',
        ],
      }}
      transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function Scanline({ opacity = 0.1 }: OpacityProps) {
  return (
    <motion.div
      className={twMerge(
        'pointer-events-none fixed inset-0 z-50',
        styles.scanline
      )}
      aria-hidden="true"
      style={{ '--scanline-opacity': opacity }}
      initial={{ opacity }}
      animate={{ opacity: [opacity, opacity * 0.5, opacity] }}
      transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function GlitchScanline() {
  return (
    <>
      <motion.div
        className={twMerge(
          'pointer-events-none fixed left-0 right-0 z-50 h-[3px] bg-white opacity-40',
          styles.rollingLine
        )}
        aria-hidden="true"
        animate={{ top: ['-3px', '100vh'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={twMerge(
          'pointer-events-none fixed left-0 right-0 z-50 h-[80px]',
          styles.flickerBand
        )}
        aria-hidden="true"
        animate={{
          top: ['-80px', '100vh'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          top: { duration: 7, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </>
  );
}

export function ScreenFlicker() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 bg-black"
      aria-hidden="true"
      animate={{ opacity: [0, 0.03, 0, 0.05, 0] }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 4,
        ease: 'easeInOut',
      }}
    />
  );
}

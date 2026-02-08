'use client';

import { motion } from 'motion/react';

import styles from './CrtTvIcon.module.css';

export function CrtTvIcon() {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.div
        className="flex size-[120px] items-center justify-center rounded-full bg-base-black"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(71, 74, 77, 0.4)',
            '0 0 0 20px rgba(71, 74, 77, 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
          className={styles.svg}
        >
          <motion.rect
            x="15"
            y="20"
            width="70"
            height="60"
            rx="3"
            stroke="#ffffff"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [1, 0.7, 1] }}
            transition={{
              pathLength: { duration: 1, ease: 'easeInOut' },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
            }}
          />

          {[25, 35, 45, 55, 65, 75].map((y, i) => (
            <motion.rect
              key={y}
              x="18"
              y={y}
              width="64"
              height="2"
              fill="#ffffff"
              opacity="0"
              animate={{
                opacity: [0, 0.8, 0, 0.6, 0],
                width: [64, 40, 64, 50, 64],
                x: [18, 28, 18, 23, 18],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1.5 + i * 0.4,
                delay: i * 0.3 + 1.5,
              }}
            />
          ))}

          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          >
            <line
              x1="50"
              y1="40"
              x2="50"
              y2="60"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <line
              x1="40"
              y1="50"
              x2="60"
              y2="50"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </motion.g>

          <motion.text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="8"
            fill="#ffffff"
            fontFamily="monospace"
            fontWeight="bold"
            opacity="0"
            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 4,
            }}
          >
            NO SIGNAL
          </motion.text>
        </svg>
      </motion.div>
    </motion.div>
  );
}

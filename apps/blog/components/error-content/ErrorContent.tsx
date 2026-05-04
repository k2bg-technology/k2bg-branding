'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button, buttonVariants } from 'ui';

const isDev = process.env.NODE_ENV === 'development';

import {
  GlitchScanline,
  Scanline,
  ScreenFlicker,
  StaticNoise,
} from './CrtEffects';
import { CrtTvIcon } from './CrtTvIcon';
import { GlitchText } from './GlitchText';

interface ErrorContentProps {
  statusCode: string;
  title: string;
  description: string;
  error?: Error & { digest?: string };
  reset: () => void;
}

export function ErrorContent({
  statusCode,
  title,
  description,
  error,
  reset,
}: ErrorContentProps) {
  return (
    <>
      <StaticNoise opacity={0.04} />
      <Scanline opacity={0.05} />
      <GlitchScanline />
      <ScreenFlicker />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 text-center">
        <CrtTvIcon />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GlitchText
            className="text-advert font-bold leading-advert text-base-black"
            intensity="high"
          >
            {statusCode}
          </GlitchText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <GlitchText
            className="text-heading-1 font-bold leading-heading-1 text-base-black"
            intensity="low"
          >
            {title}
          </GlitchText>
        </motion.div>

        <motion.p
          className="text-body-r-md text-base-default"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="mt-2 flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button variant="outline" color="dark" size="lg" onClick={reset}>
            再読み込み
          </Button>
          <Link
            href="/"
            className={buttonVariants({
              variant: 'default',
              color: 'dark',
              size: 'lg',
            })}
          >
            ホームに戻る
          </Link>
        </motion.div>

        <motion.p
          className="text-body-r-sm text-base-default opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          問題が解決しない場合は、お手数ですがお問い合わせください。
        </motion.p>

        {isDev && error && (
          <motion.details
            className="w-full max-w-xl text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <summary className="cursor-pointer text-body-r-sm text-base-default">
              エラー詳細を表示
            </summary>
            <div className="mt-2 overflow-x-auto rounded-md bg-base-light p-4">
              <p className="text-body-b-sm text-base-black">
                {error.name}: {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-body-r-sm text-base-default">
                  Digest: {error.digest}
                </p>
              )}
              {error.stack && (
                <pre className="mt-2 whitespace-pre-wrap break-words text-caption text-base-default">
                  {error.stack}
                </pre>
              )}
            </div>
          </motion.details>
        )}
      </div>
    </>
  );
}

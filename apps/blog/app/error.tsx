'use client';

import { useEffect } from 'react';

import { ErrorContent } from '../components/error-content/ErrorContent';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error, error.digest);
  }, [error]);

  return (
    <div className="col-span-full flex items-center justify-center py-12">
      <ErrorContent
        statusCode="500"
        title="エラーが発生しました"
        description="ページの読み込み中に問題が発生しました。もう一度お試しください。"
        error={error}
        reset={reset}
      />
    </div>
  );
}

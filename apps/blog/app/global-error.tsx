'use client';

import { ErrorContent } from '../components/error-content/ErrorContent';

import './globals.css';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen items-center justify-center bg-base-white text-base-black">
        <ErrorContent
          statusCode="500"
          title="予期しないエラーが発生しました"
          description="申し訳ございません。サーバーでエラーが発生しました。しばらく時間をおいてから、再度お試しください。"
          error={_error}
          reset={reset}
        />
      </body>
    </html>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ErrorContent } from '../components/error-content/ErrorContent';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-20 py-[30px]">
      <ErrorContent
        statusCode="404"
        title="ページが見つかりません"
        description="ページが見つかりませんでした。URLを確認するか、ホーム画面に戻ってください。"
        reset={() => router.refresh()}
      />
    </div>
  );
}

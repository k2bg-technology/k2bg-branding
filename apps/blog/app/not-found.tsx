'use client';

import { ErrorContent } from '../components/error-content/ErrorContent';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
      <ErrorContent
        statusCode="404"
        title="ページが見つかりません"
        description="ページが見つかりませんでした。URLを確認するか、ホーム画面に戻ってください。"
        reset={() => window.location.reload()}
      />
    </div>
  );
}

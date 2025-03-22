import React from 'react';
import { Avatar } from 'ui';

export default function ProfileCard() {
  return (
    <div className="grid gap-spacious p-spacious rounded-lg bg-base-white/50">
      <span className="inline-flex gap-normal">
        <Avatar>
          <Avatar.Image alt="author" src="/me.png" />
        </Avatar>
        <span>stranger1989</span>
      </span>
      <div className="grid gap-px">
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          東京都在住。愛知県出身。
        </p>
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          フリーランスとして、Webアプリケーションの開発支援業務をメインに行っています！得意分野はフロントエンド、UI・UX、データ分析です。
        </p>
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          当ブログは、「ITエンジニア目線で便利に思うITサービス・アプリの紹介」や、「エンジニアでなくても動かせる簡単なプログラミングを活用したライフハック」など、より多くの人の生活が少しでも快適で便利になる情報発信を目指しています！
        </p>
      </div>
    </div>
  );
}

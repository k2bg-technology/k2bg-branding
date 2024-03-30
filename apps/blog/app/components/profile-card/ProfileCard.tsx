import React from 'react';
import Image from 'next/image';
import { Avatar } from 'ui';

export default function ProfileCard() {
  return (
    <div>
      <p className="mb-6 text-subtitle-sm font-bold border-b-2 border-b-slate-100">
        プロフィール
      </p>
      <div className="grid gap-5 p-5 rounded-lg bg-base-white/50">
        <Avatar
          image={
            <div className="relative w-full h-full">
              <Image
                alt="profile image"
                src="/me.png"
                className="aspect-square h-full w-full object-cover"
                fill
                sizes="100%"
              />
            </div>
          }
          name="stranger1989"
        />
        <div className="grid gap-px">
          <p className="text-body-r-sm leading-body-r-sm text-base-black/80">
            東京都、世田谷区在住。愛知県出身。
          </p>
          <p className="text-body-r-sm leading-body-r-sm text-base-black/80">
            フリーランスとして、Webアプリケーションの開発支援業務をメインに行っています！得意分野はフロントエンド、UI・UX、データ分析です。
          </p>
          <p className="text-body-r-sm leading-body-r-sm text-base-black/80">
            当ブログは、「ITエンジニア目線で便利に思うITサービス・アプリの紹介」や、「エンジニアでなくても動かせる簡単なプログラミングを活用したライフハック」など、より多くの人の生活が少しでも快適で便利になる情報発信を目指しています！
          </p>
        </div>
      </div>
    </div>
  );
}

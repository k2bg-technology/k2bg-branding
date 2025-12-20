import React from 'react';
import { Avatar } from 'ui';

export default function ProfileCard() {
  return (
    <div className="flex flex-col gap-spacious p-spacious rounded-lg bg-base-white/50">
      <span className="inline-flex gap-normal">
        <Avatar>
          <Avatar.Image alt="author" src="/me.png" />
        </Avatar>
        <span>krd-knt</span>
      </span>
      <div className="flex flex-col gap-condensed">
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          フリーランスエンジニアとして、Webアプリケーションの開発支援を行っています。フロントエンドを中心に、UI/UXの改善やデータ分析まで幅広く携わっています。
        </p>
        <p className="text-body-r-sm leading-body-r-sm text-base-black">
          このブログでは、私が実際に役立ったIT知識/サービスの紹介や、誰でも試せるシンプルな自動化・ライフハックを発信しています。「これならできそう」と思えるヒントを、わかりやすく届けます。
        </p>
      </div>
    </div>
  );
}

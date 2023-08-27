import Image from 'next/image';

export function Background() {
  return (
    <section>
      <div className="flex flex-col gap-10 relative p-20 w-[90rem] h-[60rem] text-white">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/background-pattern.jpg"
            fill
            alt="Background Pattern Image"
          />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-heading-2 leading-heading-2 font-bold">経歴</h2>
          <div className="flex flex-col gap-5">
            <p className="text-body-sm leading-body-sm">
              情報理工学専攻 学部卒。
              初期のキャリアでは印刷メーカーにおいて、商業印刷物のデザイン・レイアウト・フォトレタッチを担当。その後、貿易商社に転職し、キッチンウェアの商品仕入れ及び販売データ分析に従事。
            </p>
            <p className="text-body-sm leading-body-sm">
              非IT業界での実務経験を通じて、業務効率の向上及び問題解決に対するITの可能性を痛感。この認識をもとに、Webアプリケーションエンジニアへの転身を決意。以降、「ヘルスケア」「ECマーケティング」「オンラインコミュニケーション」等、多様な事業領域でのアプリケーション開発に携わる。
            </p>
            <p className="text-body-sm leading-body-sm">
              現在はフリーランスエンジニアとして、「UI・UXデザイン」と「データ分析」の専門性を強みに、IT企業向けのアプリケーション開発支援や、自身のメディアを通じた知見の発信を主軸に活動を展開している。
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-heading-2 leading-heading-2 font-bold">資格</h2>
          <ul className="text-body-sm leading-body-sm">
            <li>応用情報処理技術者</li>
            <li>TOEIC 745点</li>
            <li>カラーコーディネーター2級</li>
            <li>日商簿記検定3級</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

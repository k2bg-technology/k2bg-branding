import Image from 'next/image';

export function Hero() {
  return (
    <section>
      <div className="grid grid-rows-[max(35rem)_1fr] grid-cols-full h-full md:grid-rows-1 md:grid-cols-[max(35rem)_max(80rem)]">
        <div className="relative">
          <Image
            src="/hero.jpg"
            fill
            alt="Hero Image"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-10 p-10 md:justify-center md:p-20">
          <hgroup className="flex flex-col gap-2 md:gap-0">
            <h1 className="text-heading-1 leading-tight font-bold md:leading-heading-1">
              K2.B.G. Technology
            </h1>
            <p className="text-body-md leading-body-md">
              KK Bit Growth Technology
            </p>
            <p className="text-body-lg leading-tight md:leading-body-lg">
              <strong>ITの力でビジネスのスケールアップを実現します</strong>
            </p>
          </hgroup>
          <div className="flex flex-col gap-5">
            <p className="text-body-sm leading-body-sm">
              現代のビジネスは、ITとデジタル技術の活用が不可欠になっています。しかし、ITの進歩は急速で、その効果的な利用は専門知識を必要とし、難易度が高いものとなっています。
            </p>
            <p className="text-body-sm leading-body-sm">
              私自身、非IT業界からスタートアップまで、幅広い業界での経験を通じて、伝統的なビジネスプロセスからITを活用した効率的なプロセスへの移行の難しさを感じてきました。しかし、一方で、ITを導入することでビジネスの生産性を向上させ、自由度を高め、リスクを回避できるというメリットを体感してきました。
            </p>
            <p className="text-body-sm leading-body-sm">
              その経験を活かし、IT化を推進して業務のプロセスを改善したい企業様の「
              <span className="font-bold">アプリケーション開発</span>
              」「
              <span className="font-bold">データ分析</span>
              」「
              <span className="font-bold">DXの推進</span>
              」を支援し、良きパートナーとして共に成長することこそが、提供できる最大の価値だと考えております。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

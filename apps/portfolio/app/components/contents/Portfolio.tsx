import Image from 'next/image';

export function Portfolio() {
  return (
    <section>
      <div className="flex h-[60rem]">
        <div className="flex flex-col justify-center gap-5 p-20 w-[45rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            ポートフォリオ
          </h2>
          <div>
            <p className="text-body-sm leading-body-sm">
              具体的なアプリケーション開発事例を紹介致します。
            </p>
            <p className="text-body-sm leading-body-sm">
              業務で開発したものは守秘義務の観点から掲載できませんので、個人開発にて開発したものを中心に載せております。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 text-white">
          <article>
            <div className="flex relative flex-col gap-5 p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/stock.jpg"
                  fill
                  alt="Stock Image"
                  className="object-cover brightness-50"
                />
              </div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                Webアプリ開発
              </h3>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                使用技術
              </h4>
              <p className="text-body-sm leading-body-sm">
                Node.js、Typescript、React、Next.js、Python、FastAPI、Jupyter
                Notebook
              </p>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                概要
              </h4>
              <p className="text-body-sm leading-body-sm">
                株価分析・予測アプリケーションです。株価の過去データを元に、株価の予測を行うことができます。現状は「過去の株価データの確認」と「ポートフォリオの作成」のみの機能提供ですが、今後は株価予測API機能をバックエンド側で実装し、アプリケーションで可視化できるようにしていきます。
              </p>
            </div>
          </article>
          <article>
            <div className="flex relative flex-col gap-5 p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/mobile.jpg"
                  fill
                  alt="Mobile Image"
                  className="object-cover brightness-50"
                />
              </div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                モバイルアプリ開発
              </h3>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                使用技術
              </h4>
              <p className="text-body-sm leading-body-sm">
                Node.js、Typescript、React Native、Golang、Mysql、Docker
              </p>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                概要
              </h4>
              <p className="text-body-sm leading-body-sm">
                商品仕入れ管理用のアプリケーションです。商品原価・商品在庫などをモバイルから手軽に入力・確認できるようになっています。仕入れや検品などのフィールドワーク時に、いちいちPCを開いて商品情報をExcelで確認・入力・管理することの不便さを解決するために開発致しました。
              </p>
            </div>
          </article>
          <article>
            <div className="flex relative flex-col gap-5 p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/web.jpg"
                  fill
                  alt="Web Image"
                  className="object-cover brightness-50"
                />
              </div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                Webスクレイピング
              </h3>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                使用技術
              </h4>
              <p className="text-body-sm leading-body-sm">
                Python、Scrapy、Selenium、Docker、Bigquery
              </p>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                概要
              </h4>
              <p className="text-body-sm leading-body-sm">
                多くのデータを保有することが資産と呼べる時代に、豊富なデータが存在するWebから情報を得ることは必須だと考えます。クローリングフレームワークScrapyを活用して、静的・動的（SPAなどのJS）ページ問わず情報収集できる、かつPipelineを通して、CSVやBigqueryなどにデータを流し込めるスニペットを開発致しました。
              </p>
            </div>
          </article>
          <article>
            <div className="flex relative flex-col gap-5 p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/blog.jpg"
                  fill
                  alt="Blog Image"
                  className="object-cover brightness-50"
                />
              </div>
              <h3 className="text-heading-3 leading-heading-3 font-bold">
                WordPressブログ運営
              </h3>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                使用技術
              </h4>
              <p className="text-body-sm leading-body-sm">
                HTML、CSS（SASS）、Javascript、PHP、Mysql、Wordpress、Google
                Analytics、Google AdSense
              </p>
              <h4 className="text-heading-4 leading-heading-4 font-bold">
                概要
              </h4>
              <p className="text-body-sm leading-body-sm">
                プログラミング・マーケティング・デザイン・ファイナンス・海外などのテーマのコンテンツ記事をwordpressを使用し自分の経験に基づいて作成しております。
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

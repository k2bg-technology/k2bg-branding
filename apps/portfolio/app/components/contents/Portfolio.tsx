import React from "react";
import Image from "next/image";

export function Portfolio() {
  return (
    <section>
      <div className="flex h-[60rem]">
        <div className="p-20 w-[30rem]">
          <h2>ポートフォリオ</h2>
          <p>
            具体的なアプリケーション開発事例を紹介致します。
            業務で開発したものは守秘義務の観点から掲載できませんので、個人開発にて開発したものを中心に載せております。
          </p>
        </div>
        <div className="grid grid-cols-4">
          <article>
            <div className="relative p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/stock.jpg"
                  fill={true}
                  alt="Stock Image"
                  className="object-cover"
                />
              </div>
              <h3>Webアプリ開発</h3>
              <h4>使用技術</h4>
              <p>
                Node.js、Typescript、React、Next.js、Python、FastAPI、Jupyter
                Notebook
              </p>
              <h4>概要</h4>
              <p>
                株価分析・予測アプリケーションです。株価の過去データを元に、株価の予測を行うことができます。現状は「過去の株価データの確認」と「ポートフォリオの作成」のみの機能提供ですが、今後は株価予測API機能をバックエンド側で実装し、アプリケーションで可視化できるようにしていきます。
              </p>
            </div>
          </article>
          <article>
            <div className="relative p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/mobile.jpg"
                  fill={true}
                  alt="Mobile Image"
                  className="object-cover"
                />
              </div>
              <h3>モバイルアプリ開発</h3>
              <h4>使用技術</h4>
              <p>Node.js、Typescript、React Native、Golang、Mysql、Docker</p>
              <h4>概要</h4>
              <p>
                商品仕入れ管理用のアプリケーションです。商品原価・商品在庫などをモバイルから手軽に入力・確認できるようになっています。仕入れや検品などのフィールドワーク時に、いちいちPCを開いて商品情報をExcelで確認・入力・管理することの不便さを解決するために開発致しました。
              </p>
            </div>
          </article>
          <article>
            <div className="relative p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/web.jpg"
                  fill={true}
                  alt="Web Image"
                  className="object-cover"
                />
              </div>
              <h3>Webスクレイピング</h3>
              <h4>使用技術</h4>
              <p>Python、Scrapy、Selenium、Docker、Bigquery</p>
              <h4>概要</h4>
              <p>
                多くのデータを保有することが資産と呼べる時代に、豊富なデータが存在するWebから情報を得ることは必須だと考えます。クローリングフレームワークScrapyを活用して、静的・動的（SPAなどのJS）ページ問わず情報収集できる、かつPipelineを通して、CSVやBigqueryなどにデータを流し込めるスニペットを開発致しました。
              </p>
            </div>
          </article>
          <article>
            <div className="relative p-20 w-[50rem] h-full">
              <div className="absolute top-0 left-0 -z-10 w-full h-full">
                <Image
                  src="/blog.jpg"
                  fill={true}
                  alt="Blog Image"
                  className="object-cover"
                />
              </div>
              <h3>WordPressブログ運営</h3>
              <h4>使用技術</h4>
              <p>
                HTML、CSS（SASS）、Javascript、PHP、Mysql、Wordpress、Google
                Analytics、Google AdSense
              </p>
              <h4>概要</h4>
              <p>
                プログラミング・マーケティング・デザイン・ファイナンス・海外などのテーマのコンテンツ記事をwordpressを使用し自分の経験に基づいて作成しております。
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <main>
        {/* HERO */}
        <section>
          <div>
            <hgroup>
              <h1>K2. B. G. Technology</h1>
              <p>KK Bit Growth Technology</p>
              <p>
                <strong>ITの力でビジネスのスケールアップを実現します</strong>
              </p>
            </hgroup>
            <p>
              現代のビジネスは、ITとデジタル技術の活用が不可欠になっています。しかし、ITの進歩は急速で、その効果的な利用は専門知識を必要とし、難易度が高いものとなっています。
            </p>
            <p>
              私自身、非IT業界からスタートアップまで、幅広い業界での経験を通じて、伝統的なビジネスプロセスからITを活用した効率的なプロセスへの移行の難しさを感じてきました。しかし、一方で、ITを導入することでビジネスの生産性を向上させ、自由度を高め、リスクを回避できるというメリットを体感してきました。
            </p>
            <p>
              その経験を活かし、IT化を推進して業務のプロセスを改善したい企業様の
              「<em>アプリケーション開発</em>」「<em>データ分析</em>」「
              <em>DXの推進</em>」
              を支援し、良きパートナーとして共に成長することこそが、提供できる最大の価値だと考えております。
            </p>
          </div>
        </section>
        <hr /> {/* TODO: DELETE SEPARATOR */}
        {/* BACKGROUND */}
        <section>
          <div>
            <h2>経歴</h2>
            <p>情報理工学専攻 学部卒。</p>
            <p>
              初期のキャリアでは印刷メーカーにおいて、商業印刷物のデザイン・レイアウト・フォトレタッチを担当。その後、貿易商社に転職し、キッチンウェアの商品仕入れ及び販売データ分析に従事。
            </p>
            <p>
              非IT業界での実務経験を通じて、業務効率の向上及び問題解決に対するITの可能性を痛感。この認識をもとに、Webアプリケーションエンジニアへの転身を決意。
              以降、「ヘルスケア」「ECマーケティング」「オンラインコミュニケーション」等、多様な事業領域でのアプリケーション開発に携わる。
            </p>
            <p>
              現在はフリーランスエンジニアとして、「UI・UXデザイン」と「データ分析」の専門性を強みに、IT企業向けのアプリケーション開発支援や、自身のメディアを通じた知見の発信を主軸に活動を展開している。
            </p>
            <h2>資格</h2>
            <ul>
              <li>応用情報処理技術者</li>
              <li>TOEIC 745点</li>
              <li>カラーコーディネーター2級</li>
              <li>日商簿記検定3級</li>
            </ul>
          </div>
        </section>
        <hr /> {/* TODO: DELETE SEPARATOR */}
        {/* SKILL */}
        <section>
          <div>
            <h2>スキル</h2>
            <h3>プログラミング・フレームワーク</h3>
            <p>
              Nodejs（Javascript、Typescript）、React(ReactNative）、Python、FastAPI、Scrapy、Golang、Wordpress
            </p>
            <h3>UI・UX</h3>
            <p>HTML、CSS（SASS）、Figma、Photoshop、Illustrator、Indesign</p>
            <h3>データ分析</h3>
            <p>
              Google Analytics、Google Tag Manager、Google Colab、Google Looker
              Studio、Bigquery、Tableau、Datadog
            </p>
            <h3>クラウド・DevOps</h3>
            <p>Git・Github、AWS、GCP、Docker、CircleCI、Github Actions</p>
          </div>
          <div>
            <ul>
              <li>typescript logo</li>
              <li>python logo</li>
              <li>golang logo</li>
              <li>react logo</li>
              <li>figma logo</li>
              <li>wordpress logo</li>
              <li>jupyter logo</li>
              <li>tensorflow logo</li>
              <li>aws logo</li>
              <li>google cloud logo</li>
              <li>docker logo</li>
              <li>circleci logo</li>
            </ul>
          </div>
        </section>
        <hr /> {/* TODO: DELETE SEPARATOR */}
        {/* PORTFOLIO */}
        <section>
          <div>
            <h2>ポートフォリオ</h2>
            <p>
              具体的なアプリケーション開発事例を紹介致します。
              業務で開発したものは守秘義務の観点から掲載できませんので、個人開発にて開発したものを中心に載せております。
            </p>
          </div>
          {/* GALLERY */}
          <div>
            <article>
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
            </article>
            <article>
              <h3>モバイルアプリ開発</h3>
              <h4>使用技術</h4>
              <p>Node.js、Typescript、React Native、Golang、Mysql、Docker</p>
              <h4>概要</h4>
              <p>
                商品仕入れ管理用のアプリケーションです。商品原価・商品在庫などをモバイルから手軽に入力・確認できるようになっています。仕入れや検品などのフィールドワーク時に、いちいちPCを開いて商品情報をExcelで確認・入力・管理することの不便さを解決するために開発致しました。
              </p>
            </article>
            <article>
              <h3>Webスクレイピング</h3>
              <h4>使用技術</h4>
              <p>Python、Scrapy、Selenium、Docker、Bigquery</p>
              <h4>概要</h4>
              <p>
                多くのデータを保有することが資産と呼べる時代に、豊富なデータが存在するWebから情報を得ることは必須だと考えます。クローリングフレームワークScrapyを活用して、静的・動的（SPAなどのJS）ページ問わず情報収集できる、かつPipelineを通して、CSVやBigqueryなどにデータを流し込めるスニペットを開発致しました。
              </p>
            </article>
            <article>
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
            </article>
          </div>
        </section>
        <hr /> {/* TODO: DELETE SEPARATOR */}
        {/* CONTACT */}
        <section>
          <div>
            <h2>お問い合わせ</h2>
            <p>
              必要事項をご入力いただき、送信ボタンを押してください。返信には数日かかる場合がございますが、極力早急に返信するように致しますので、お気軽にお問い合わせいただけると幸いです。
            </p>
            <p>
              平日は1〜2時間、休日は3時間程度で在宅ワークをお受けすることが可能です。※
              誠に恐れ入りますが、平日は9:00〜20:00以外でのご対応となります。 ※
              案件によってはお受けするのが難しい場合もございますので、適宜ご相談いただけると幸いです。
            </p>
          </div>
          <div>
            <form method="post" action="https://formspree.io/f/mjvjargb">
              <div>
                <label htmlFor="name">お名前</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Yamada Taro"
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Eメール</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="test@mail.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message">メッセージ</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  placeholder="ここにメッセージをご記入ください"
                  required
                />
              </div>
              <div>
                <ul>
                  <li>
                    <input type="submit" value="送信" />
                  </li>
                  <li>
                    <input type="reset" value="リセット" />
                  </li>
                </ul>
              </div>
            </form>
          </div>
          <div>
            <ul>
              <li>
                <a
                  href="https://github.com/stranger1989"
                  target="_blank"
                  rel="noreferrer"
                >
                  @stranger1989
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/BykkLearn"
                  target="_blank"
                  rel="noreferrer"
                >
                  @WebDeveloper_InTokyo
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <hr /> {/* TODO: DELETE SEPARATOR */}
      {/* COPYRIGHT */}
      <footer>
        &copy; K2.B.G. Technology Design:
        <a href="https://html5up.net">HTML5 UP</a>.
      </footer>
    </>
  );
}

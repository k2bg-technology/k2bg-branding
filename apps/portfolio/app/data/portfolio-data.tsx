export const PORTFOLIO_DATA = [
  {
    key: 'trading-dashboard',
    title: 'Webアプリ開発',
    techStack:
      'Node.js、Typescript、React、Next.js、Python、FastAPI、Jupyter Notebook',
    overview:
      '株価分析・予測アプリケーションです。株価の過去データを元に、株価の予測を行うことができます。現状は「過去の株価データの確認」と「ポートフォリオの作成」のみの機能提供ですが、今後は株価予測API機能をバックエンド側で実装し、アプリケーションで可視化できるようにしていきます。',
    backgroundImage: '/stock.jpg',
    siteLink: [
      {
        buttonText: 'Github（アプリ）',
        url: 'https://github.com/stranger1989/trading-dashboard',
      },
      {
        buttonText: 'Github（API） ※株価予測API追加実装予定',
        url: 'https://github.com/stranger1989/ml-playground-api',
      },
    ],
    preview: {
      buttonText: 'Preview',
      video: '/stock-app.mp4',
    },
  },
  {
    key: 'mobile-development',
    title: 'モバイルアプリ開発',
    techStack: 'Node.js、Typescript、React Native、Golang、Mysql、Docker',
    overview:
      '商品仕入れ管理用のアプリケーションです。商品原価・商品在庫などをモバイルから手軽に入力・確認できるようになっています。\n仕入れや検品などのフィールドワーク時に、いちいちPCを開いて商品情報をExcelで確認・入力・管理することの不便さを解決するために開発致しました。',
    backgroundImage: '/mobile.jpg',
    siteLink: [
      {
        buttonText: 'Github（アプリ）',
        url: 'https://github.com/stranger1989/merchandise_control_system_native_app',
      },
      {
        buttonText: 'Github（API）',
        url: 'https://github.com/stranger1989/merchandise_control_system',
      },
    ],
    preview: {
      buttonText: 'Preview',
      video: '/mobile.mp4',
    },
  },
  {
    key: 'web-scraping',
    title: 'Webスクレイピング',
    techStack: 'Python、Scrapy、Selenium、Docker、Bigquery',
    overview:
      '多くのデータを保有することが資産と呼べる時代に、豊富なデータが存在するWebから情報を得ることは必須だと考えます。\nクローリングフレームワークScrapyを活用して、静的・動的ページ問わず情報収集できる、かつPipelineを通して、CSVやBigqueryなどにデータを流し込めるスニペットを開発致しました。',
    backgroundImage: '/web.jpg',
    siteLink: [
      {
        buttonText: 'Github',
        url: 'https://github.com/stranger1989/scrapy_snippets',
      },
    ],
    preview: {
      buttonText: 'Preview',
      video: '/scrapy.mp4',
    },
  },
  {
    key: 'blog-management',
    title: 'WordPressブログ運営',
    techStack:
      'HTML、CSS（SASS）、Javascript、PHP、Mysql、Wordpress、Google Analytics、Google AdSense',
    overview:
      'プログラミング・マーケティング・デザイン・ファイナンス・海外などのテーマのコンテンツ記事をwordpressを使用し自分の経験に基づいて作成しております。',
    backgroundImage: '/blog.jpg',
    siteLink: [
      {
        buttonText: 'サイトURL',
        url: 'https://blank-oldstranger.com/',
      },
      {
        buttonText: 'Github（wordpress local template）',
        url: 'https://github.com/stranger1989/wordpress-local-dev-template',
      },
    ],
    preview: {
      buttonText: 'Preview',
      video: '/blank.mp4',
    },
  },
];

import type { Metadata } from 'next';

import { PageLayout } from '../../components/page-layout';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';
import { Sidebar } from '../../components/sidebar/Sidebar';

import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせページ',
  alternates: {
    canonical: '/contact',
  },
};

export default function Page() {
  return (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
      <PageLayout.Row>
        <PageLayout.Content>
          <h1 className="text-heading-1 font-bold">お問い合わせ</h1>
          <p className="mt-4 text-body-r-md leading-body-r-md text-base-black text-justify whitespace-pre-wrap">
            必要事項をご入力いただき、送信ボタンを押してください。返信には数日かかる場合がございますが、極力早急に返信するように致しますので、お気軽にお問い合わせいただけると幸いです。平日は1〜2時間、休日は3時間程度で在宅ワークをお受けすることが可能です。
          </p>
          <ul className="mt-2 text-body-r-md leading-body-r-md text-base-black text-justify">
            <li>
              ※ 誠に恐れ入りますが、平日は9:00〜20:00以外でのご対応となります。
            </li>
            <li>
              ※
              案件によってはお受けするのが難しい場合もございますので、適宜ご相談いただけると幸いです。
            </li>
          </ul>
        </PageLayout.Content>
      </PageLayout.Row>
      <PageLayout.Row>
        <PageLayout.Content colStart={1} colEnd={10}>
          <ContactForm />
        </PageLayout.Content>
        <PageLayout.Aside colStart={10} colEnd={13}>
          <Sidebar />
        </PageLayout.Aside>
      </PageLayout.Row>
    </PageLayout>
  );
}

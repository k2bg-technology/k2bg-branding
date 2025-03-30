import { Metadata } from 'next';

import Sidebar from '../../components/sidebar/Sidebar';

import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせページ',
};

export default function Page() {
  return (
    <>
      <div className="grid-cols-[subgrid] gap-12 col-span-full">
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
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-start-1 col-end-10">
          <ContactForm />
        </div>
        <div className="hidden xl:flex col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

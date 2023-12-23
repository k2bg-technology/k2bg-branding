import { InputButton } from 'ui';

import Sidebar from '../components/sidebar/Sidebar';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const FORMSPREE_FORM_ACTION_URL = process.env.FORMSPREE_FORM_ACTION_URL ?? '';

export default function Page() {
  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-12">
        <h1 className="text-heading-1 font-bold">お問い合わせ</h1>
        <p className="mt-4 text-body-sm leading-body-sm text-base-black/80 text-justify whitespace-pre-wrap">
          必要事項をご入力いただき、送信ボタンを押してください。返信には数日かかる場合がございますが、極力早急に返信するように致しますので、お気軽にお問い合わせいただけると幸いです。平日は1〜2時間、休日は3時間程度で在宅ワークをお受けすることが可能です。
        </p>
        <ul className="mt-2 text-body-sm leading-body-sm text-base-black/80 text-justify">
          <li>
            ※ 誠に恐れ入りますが、平日は9:00〜20:00以外でのご対応となります。
          </li>
          <li>
            ※
            案件によってはお受けするのが難しい場合もございますので、適宜ご相談いただけると幸いです。
          </li>
        </ul>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="col-start-1 col-end-10">
          <form
            method="post"
            action={FORMSPREE_FORM_ACTION_URL}
            className="flex flex-col gap-10 h-full md:gap-16"
          >
            <div className="flex flex-col gap-10 md:flex-row">
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="text-body-sm leading-body-sm text-base-black font-bold"
                  htmlFor="name"
                >
                  お名前
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="お名前"
                  required
                  className="focus:border-opacity-40 border-2 text-base-black border-opacity-20 rounded-lg p-3 text-body-sm leading-body-sm placeholder-base-black placeholder-opacity-70"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="text-body-sm leading-body-sm text-base-black font-bold"
                  htmlFor="email"
                >
                  Eメール
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Eメール"
                  required
                  className="focus:border-opacity-40 border-2 rounded-lg p-3 text-base-black text-body-sm leading-body-sm placeholder-base-black placeholder-opacity-70"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label
                className="text-body-sm leading-body-sm text-base-black font-bold"
                htmlFor="message"
              >
                メッセージ
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                placeholder="メッセージ"
                required
                className="focus:border-opacity-40 border-2 rounded-lg p-3 text-base-black text-body-sm leading-body-sm placeholder-base-black placeholder-opacity-70"
              />
            </div>
            <ul className="flex flex-col gap-5 md:flex-row">
              <li>
                <InputButton
                  type="submit"
                  value="送信"
                  className="w-full md:!px-10"
                  color="dark"
                  variant="outlined"
                />
              </li>
              <li>
                <InputButton
                  type="reset"
                  value="リセット"
                  className="w-full md:!px-10"
                  color="dark"
                  variant="outlined"
                />
              </li>
            </ul>
          </form>
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

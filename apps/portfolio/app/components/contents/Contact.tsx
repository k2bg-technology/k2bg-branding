import Image from 'next/image';
import { SvgIcon } from 'ui';

export function Contact() {
  return (
    <section>
      <div className="flex relative h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image src="/contact-pattern.jpg" fill alt="Contact Pattern Image" />
        </div>
        <div className="flex flex-col justify-center gap-5 p-20 w-[50rem] text-white h-full">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            お問い合わせ
          </h2>
          <p className="text-body-sm leading-body-sm">
            必要事項をご入力いただき、送信ボタンを押してください。返信には数日かかる場合がございますが、極力早急に返信するように致しますので、お気軽にお問い合わせいただけると幸いです。
          </p>
          <p className="text-body-sm leading-body-sm">
            平日は1〜2時間、休日は3時間程度で在宅ワークをお受けすることが可能です。※
            誠に恐れ入りますが、平日は9:00〜20:00以外でのご対応となります。 ※
            案件によってはお受けするのが難しい場合もございますので、適宜ご相談いただけると幸いです。
          </p>
        </div>
        <div className="p-20 h-full">
          <form
            method="post"
            action="https://formspree.io/f/mjvjargb"
            className="flex flex-col justify-center gap-16 h-full"
          >
            <div className="flex gap-10">
              <div className="flex flex-col gap-2">
                <label
                  className="text-body-sm leading-body-sm text-white font-bold"
                  htmlFor="name"
                >
                  お名前
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Yamada Taro"
                  required
                  className="text-body-sm leading-body-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-body-sm leading-body-sm text-white font-bold"
                  htmlFor="email"
                >
                  Eメール
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="test@mail.com"
                  required
                  className="text-body-sm leading-body-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-body-sm leading-body-sm text-white font-bold"
                htmlFor="message"
              >
                メッセージ
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                placeholder="ここにメッセージをご記入ください"
                required
                className="text-body-sm leading-body-sm"
              />
            </div>
            <ul className="flex gap-5">
              <li>
                <input
                  type="submit"
                  value="送信"
                  className="block px-16 py-3 bg-white text-body-sm leading-body-sm"
                />
              </li>
              <li>
                <input
                  type="reset"
                  value="リセット"
                  className="block px-16 py-3 bg-white text-body-sm leading-body-sm"
                />
              </li>
            </ul>
          </form>
        </div>
        <div className="flex items-center py-20 text-white">
          <ul className="flex flex-col justify-center gap-10 border-l border-white border-opacity-50 px-20 h-full">
            <li className="flex relative items-center gap-5">
              <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                <SvgIcon name="github" className="w-8 h-8" />
              </div>
              <a
                href="https://github.com/stranger1989"
                target="_blank"
                rel="noreferrer"
              >
                @stranger1989
              </a>
            </li>
            <li className="flex relative items-center gap-5">
              <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                <SvgIcon name="x" className="w-8 h-8" />
              </div>
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
      </div>
    </section>
  );
}

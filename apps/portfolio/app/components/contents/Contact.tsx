import Image from 'next/image';
import { InputButton, SvgIcon } from 'ui';

export function Contact() {
  return (
    <section>
      <div className="flex flex-col relative md:flex-row md:h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image src="/contact-pattern.jpg" fill alt="Contact Pattern Image" />
        </div>
        <div className="flex flex-col justify-center gap-5 p-10 w-full text-white h-full md:p-20 md:w-[60rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            お問い合わせ
          </h2>
          <p className="text-body-sm leading-body-sm">
            必要事項をご入力いただき、送信ボタンを押してください。返信には数日かかる場合がございますが、極力早急に返信するように致しますので、お気軽にお問い合わせいただけると幸いです。
          </p>
          <p className="text-body-sm leading-body-sm">
            平日は1〜2時間、休日は3時間程度で在宅ワークをお受けすることが可能です。
          </p>
          <p className="text-body-sm leading-body-sm whitespace-pre-line">
            {`※ 誠に恐れ入りますが、平日は9:00〜20:00以外でのご対応となります。 \n※ 案件によってはお受けするのが難しい場合もございますので、適宜ご相談いただけると幸いです。`}
          </p>
        </div>
        <div className="p-10 w-full h-full md:p-20 md:w-[60rem]">
          <form
            method="post"
            action="https://formspree.io/f/mjvjargb"
            className="flex flex-col justify-center gap-10 h-full md:gap-16"
          >
            <div className="flex flex-col gap-10 md:flex-row">
              <div className="flex flex-col gap-2 w-full">
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
                  className="focus:border-opacity-40 border-2 border-white border-opacity-20 rounded-lg p-3 text-white text-body-sm leading-body-sm placeholder-white placeholder-opacity-70"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
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
                  className="focus:border-opacity-40 border-2 border-white border-opacity-20 rounded-lg p-3 text-white text-body-sm leading-body-sm placeholder-white placeholder-opacity-70"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
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
                className="focus:border-opacity-40 border-2 border-white border-opacity-20 rounded-lg p-3 text-white text-body-sm leading-body-sm placeholder-white placeholder-opacity-70"
              />
            </div>
            <ul className="flex flex-col gap-5 md:flex-row">
              <li>
                <InputButton
                  type="submit"
                  value="送信"
                  className="w-full md:!px-10"
                />
              </li>
              <li>
                <InputButton
                  type="reset"
                  value="リセット"
                  className="w-full md:!px-10"
                />
              </li>
            </ul>
          </form>
        </div>
        <div className="flex justify-center py-10 text-white md:items-center md:py-20">
          <ul className="flex flex-col justify-center gap-10 border-white border-opacity-50 px-20 h-full md:border-l">
            <li className="flex relative items-center gap-5">
              <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                <SvgIcon name="github" className="w-8 h-8" />
              </div>
              <a
                href="https://github.com/stranger1989"
                target="_blank"
                rel="noreferrer"
                className="text-body-sm leading-body-sm"
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
                className="text-body-sm leading-body-sm"
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

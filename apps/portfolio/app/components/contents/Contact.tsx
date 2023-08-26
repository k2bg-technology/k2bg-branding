import Image from 'next/image';

import SvgIcon from '../icon';

export function Contact() {
  return (
    <section>
      <div className="relative p-20 w-[90rem] h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image src="/contact-pattern.jpg" fill alt="Contact Pattern Image" />
        </div>
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
              <SvgIcon name="github" className="w-20 h-20" />
              <a
                href="https://github.com/stranger1989"
                target="_blank"
                rel="noreferrer"
              >
                @stranger1989
              </a>
            </li>
            <li>
              <SvgIcon name="x" className="w-20 h-20" />
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

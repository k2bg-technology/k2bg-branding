import Image from 'next/image';
import { TFunction } from 'i18next';
import { InputButton, SvgIcon } from 'ui';

export function Contact({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="flex flex-col relative md:flex-row md:h-[60rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/contact-pattern.jpg"
            fill
            alt="Contact Pattern Image"
          />
        </div>
        <div className="flex flex-col justify-center gap-5 p-10 w-full text-white h-full md:p-20 md:w-[60rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {t('contact.contact')}
          </h2>
          <p className="text-body-sm leading-body-sm">
            {t('contact.description1')}
          </p>
          <p className="text-body-sm leading-body-sm">
            {t('contact.description2')}
          </p>
          <p className="text-body-sm leading-body-sm whitespace-pre-line">
            {t('contact.description3')}
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
                  {t('contact.form.nameLabel')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder={t('contact.form.namePlaceholder')}
                  required
                  className="focus:border-opacity-40 border-2 border-white border-opacity-20 rounded-lg p-3 text-white text-body-sm leading-body-sm placeholder-white placeholder-opacity-70"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label
                  className="text-body-sm leading-body-sm text-white font-bold"
                  htmlFor="email"
                >
                  {t('contact.form.emailLabel')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t('contact.form.emailPlaceholder')}
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
                {t('contact.form.messageLabel')}
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                placeholder={t('contact.form.messagePlaceholder')}
                required
                className="focus:border-opacity-40 border-2 border-white border-opacity-20 rounded-lg p-3 text-white text-body-sm leading-body-sm placeholder-white placeholder-opacity-70"
              />
            </div>
            <ul className="flex flex-col gap-5 md:flex-row">
              <li>
                <InputButton
                  type="submit"
                  value={t('contact.form.submit')}
                  className="w-full md:!px-10"
                />
              </li>
              <li>
                <InputButton
                  type="reset"
                  value={t('contact.form.reset')}
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
                {t('contact.githubAccountName')}
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
                {t('contact.xAccountName')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

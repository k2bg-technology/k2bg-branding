import Image from 'next/image';
import { TFunction } from 'i18next';
import { Icon, Button, Form } from 'ui';

export function Contact({ t }: { t: TFunction }) {
  return (
    <section>
      <div className="flex flex-col relative md:flex-row md:h-[37.5rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/contact-pattern.jpg"
            fill
            alt="Contact Pattern Image"
          />
        </div>
        <div className="flex flex-col justify-center gap-spacious p-6 w-full text-white h-full md:p-12 md:w-[37.5rem]">
          <h2 className="text-heading-2 leading-heading-2 font-bold">
            {t('contact.contact')}
          </h2>
          <p className="text-body-r-sm leading-body-r-sm">
            {t('contact.description1')}
          </p>
          <p className="text-body-r-sm leading-body-r-sm">
            {t('contact.description2')}
          </p>
          <p className="text-body-r-sm leading-body-r-sm whitespace-pre-line">
            {t('contact.description3')}
          </p>
        </div>
        <div className="p-6 w-full h-full md:p-12 md:w-[37.5rem]">
          <form
            method="post"
            action="https://formspree.io/f/mjvjargb"
            className="flex flex-col justify-center gap-spacious h-full"
          >
            <div className="flex flex-col gap-spacious md:flex-row">
              <Form.Control color="light">
                <div className="flex flex-col gap-normal w-full">
                  <Form.Label
                    htmlFor="name"
                    data-gtm="contact_click_name_label"
                  >
                    {t('contact.form.nameLabel')}
                  </Form.Label>
                  <Form.Input
                    type="text"
                    name="name"
                    id="name"
                    placeholder={t('contact.form.namePlaceholder')}
                    required
                    data-gtm="contact_focus_name_field"
                  />
                </div>
              </Form.Control>
              <Form.Control color="light">
                <div className="flex flex-col gap-normal w-full">
                  <Form.Label
                    htmlFor="email"
                    data-gtm="contact_click_email_label"
                  >
                    {t('contact.form.emailLabel')}
                  </Form.Label>
                  <Form.Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    required
                    data-gtm="contact_focus_email_field"
                  />
                </div>
              </Form.Control>
            </div>
            <Form.Control color="light">
              <div className="flex flex-col gap-normal w-full">
                <Form.Label
                  htmlFor="message"
                  data-gtm="contact_click_message_label"
                >
                  {t('contact.form.messageLabel')}
                </Form.Label>
                <Form.Textarea
                  name="message"
                  id="message"
                  rows={4}
                  placeholder={t('contact.form.messagePlaceholder')}
                  required
                  data-gtm="contact_focus_message_field"
                />
              </div>
            </Form.Control>
            <ul className="flex gap-spacious">
              <li>
                <Button
                  type="submit"
                  color="light"
                  variant="outline"
                  data-gtm="contact_submit_form"
                >
                  {t('contact.form.submit')}
                </Button>
              </li>
              <li>
                <Button
                  type="reset"
                  color="light"
                  variant="outline"
                  data-gtm="contact_reset_form"
                >
                  {t('contact.form.reset')}
                </Button>
              </li>
            </ul>
          </form>
        </div>
        <div className="flex justify-center py-6 text-white md:items-center md:py-12">
          <ul className="flex flex-col justify-center gap-spacious border-white/50 px-12 h-full md:border-l">
            <li className="flex relative items-center gap-normal">
              <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-10 after:h-10 flex justify-center items-center w-10 h-10">
                <Icon name="github" width={20} height={20} />
              </div>
              <a
                href="https://github.com/stranger1989"
                target="_blank"
                rel="noreferrer"
                className="text-body-r-sm leading-body-r-sm hover:opacity-80"
                data-gtm="contact_click_github"
              >
                {t('contact.githubAccountName')}
              </a>
            </li>
            <li className="flex relative items-center gap-normal">
              <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-10 after:h-10 flex justify-center items-center w-10 h-10">
                <Icon name="instagram" width={20} height={20} />
              </div>
              <a
                href="https://www.instagram.com/k2bg_graphics"
                target="_blank"
                rel="noreferrer"
                className="text-body-r-sm leading-body-r-sm hover:opacity-80"
                data-gtm="contact_click_instagram"
              >
                {t('contact.instagramAccountName')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

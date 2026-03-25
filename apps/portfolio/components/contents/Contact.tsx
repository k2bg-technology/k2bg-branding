import Image from 'next/image';
import { Button, Form, Icon } from 'ui';
import type { Dictionary } from '../../i18n/dictionaries';

type ContactDictionary = Dictionary['contact'];

export function Contact({ dictionary }: { dictionary: ContactDictionary }) {
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
            {dictionary.contact}
          </h2>
          <p className="text-body-r-sm leading-body-r-sm">
            {dictionary.description1}
          </p>
          <p className="text-body-r-sm leading-body-r-sm">
            {dictionary.description2}
          </p>
          <p className="text-body-r-sm leading-body-r-sm whitespace-pre-line">
            {dictionary.description3}
          </p>
        </div>
        <div className="p-6 w-full h-full md:p-12 md:w-[37.5rem]">
          <form
            method="post"
            action={process.env.NEXT_PUBLIC_FORMSPREE_FORM_ACTION_URL}
            className="flex flex-col justify-center gap-spacious h-full"
          >
            <div className="flex flex-col gap-spacious md:flex-row">
              <Form.Control color="light">
                <div className="flex flex-col gap-normal w-full">
                  <Form.Label
                    htmlFor="name"
                    data-gtm="contact_click_name_label"
                  >
                    {dictionary.form.nameLabel}
                  </Form.Label>
                  <Form.Input
                    type="text"
                    name="name"
                    id="name"
                    placeholder={dictionary.form.namePlaceholder}
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
                    {dictionary.form.emailLabel}
                  </Form.Label>
                  <Form.Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder={dictionary.form.emailPlaceholder}
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
                  {dictionary.form.messageLabel}
                </Form.Label>
                <Form.Textarea
                  name="message"
                  id="message"
                  rows={4}
                  placeholder={dictionary.form.messagePlaceholder}
                  required
                  className="min-h-[4lh] max-h-[15lh]"
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
                  {dictionary.form.submit}
                </Button>
              </li>
              <li>
                <Button
                  type="reset"
                  color="light"
                  variant="outline"
                  data-gtm="contact_reset_form"
                >
                  {dictionary.form.reset}
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
                href="https://github.com/k2bg-technology"
                target="_blank"
                rel="noreferrer"
                className="text-body-r-sm leading-body-r-sm hover:opacity-80"
                data-gtm="contact_click_github"
              >
                {dictionary.githubAccountName}
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
                {dictionary.instagramAccountName}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

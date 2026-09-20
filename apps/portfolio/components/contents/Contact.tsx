import Image from 'next/image';
import { Icon } from 'ui';
import type { Dictionary } from '../../i18n/dictionaries';

import { ContactForm } from './ContactForm';

type ContactDictionary = Dictionary['contact'];

export function Contact({ dictionary }: { dictionary: ContactDictionary }) {
  return (
    <section>
      <div className="flex flex-col relative md:flex-row md:h-[37.5rem]">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <Image
            src="/images/contact-pattern.jpg"
            fill
            alt={dictionary.imageAlt}
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
          <ContactForm
            dictionary={dictionary.form}
            actionUrl={process.env.NEXT_PUBLIC_FORMSPREE_FORM_ACTION_URL}
          />
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

import { format } from 'date-fns';
import Link from 'next/link';
import { buttonVariants, Icon } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';

export function Footer() {
  return (
    <footer className="col-span-full grid grid-cols-[subgrid]">
      <div className="col-span-full grid grid-cols-[subgrid] relative mt-[65px] bg-base-black h-full">
        <div
          style={{
            clipPath:
              "path('M1440 64.5909H1090.08C833.336 64.5909 580.229 -7.62939e-06 360 -7.62939e-06C139.771 -7.62939e-06 0 64.5909 0 64.5909V116H1440V64.5909Z')",
          }}
          className="absolute top-[-64px] bg-base-black h-[116px] w-full -z-10"
        />
        <div className="col-start-2 -col-end-2 grid place-self-end py-8 w-full h-full">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex justify-center sm:justify-start">
              <Link href="/" data-gtm="footer_click_home">
                <span className="sr-only">Home</span>
                <CompanyLogo className="text-white hover:opacity-90" />
              </Link>
            </div>

            <nav>
              <ul className="flex flex-wrap items-center gap-4">
                <li>
                  <Link
                    href="/category/ENGINEERING"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_engineering"
                  >
                    Engineering
                  </Link>
                </li>

                <li>
                  <Link
                    href="/category/DESIGN"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_design"
                  >
                    Design
                  </Link>
                </li>

                <li>
                  <Link
                    href="/category/DATA_SCIENCE"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_data_science"
                  >
                    Data Science
                  </Link>
                </li>

                <li>
                  <Link
                    href="/category/LIFE_STYLE"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_life_style"
                  >
                    Life Style
                  </Link>
                </li>

                <li>
                  <Link
                    href="/concept"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_concept"
                  >
                    Concept
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className={buttonVariants({
                      color: 'light',
                      variant: 'ghost',
                      className: '!font-normal',
                    })}
                    data-gtm="footer_click_contact"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-between">
            <p className="mt-4 text-left text-body-r-sm text-white lg:mt-0">
              {`Copyright © ${format(
                new Date(),
                'yyyy'
              )} K2.B.G.Technology All rights reserved.`}
            </p>

            <div className="flex justify-center sm:justify-start">
              <ul className="flex justify-center gap-5 h-full">
                <li
                  className="flex relative items-center gap-5"
                  data-gtm="footer_click_instagram"
                >
                  <a
                    href="https://www.instagram.com/k2bg_graphics"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="instagram"
                    className={buttonVariants({
                      variant: 'ghost',
                      color: 'light',
                      size: 'icon',
                    })}
                  >
                    <Icon name="instagram" color="var(--color-base-white)" />
                  </a>
                </li>
                <li
                  className="flex relative items-center gap-5"
                  data-gtm="footer_click_github"
                >
                  <a
                    href="https://github.com/k2bg-technology"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="github"
                    className={buttonVariants({
                      variant: 'ghost',
                      color: 'light',
                      size: 'icon',
                    })}
                  >
                    <Icon name="github" color="var(--color-base-white)" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

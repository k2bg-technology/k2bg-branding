import React from 'react';
import Link from 'next/link';
import { Button, SvgIcon } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';

export default function Footer() {
  return (
    <footer>
      <div className="relative mt-[65px] bg-base-black h-full">
        <div
          style={{
            clipPath:
              "path('M1440 64.5909H1090.08C833.336 64.5909 580.229 -7.62939e-06 360 -7.62939e-06C139.771 -7.62939e-06 0 64.5909 0 64.5909V116H1440V64.5909Z')",
          }}
          className="absolute top-[-64px] bg-base-black h-[116px] w-full -z-10"
        />
        <div className="grid place-self-end mx-auto px-6 py-8 w-full md:w-[72rem] xl:w-[114rem] h-full">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex justify-center sm:justify-start">
              <Link href="/">
                <span className="sr-only">Home</span>
                <CompanyLogo className="text-white" />
              </Link>
            </div>

            <nav>
              <ul className="flex flex-wrap items-center gap-4">
                <li>
                  <Link href="/category/engineering" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Engineering
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/design" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Design
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/data-science" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Data Science
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/life-style" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Life Style
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/concept" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Concept
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/contact" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="text"
                    >
                      Contact
                    </Button>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-between">
            <p className="mt-4 text-center text-body-r-sm text-white lg:mt-0 lg:text-right">
              Copyright &copy; 2022. All rights reserved.
            </p>

            <div className="flex justify-center sm:justify-start">
              <ul className="flex justify-center gap-5 h-full">
                <li className="flex relative items-center gap-5">
                  <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                    <SvgIcon name="x" fill="white" className="w-10 h-10" />
                  </div>
                </li>
                <li className="flex relative items-center gap-5">
                  <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                    <SvgIcon name="github" fill="white" className="w-10 h-10" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

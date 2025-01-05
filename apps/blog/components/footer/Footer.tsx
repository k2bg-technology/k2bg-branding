import React from 'react';
import Link from 'next/link';
import { Button, Icon } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';

export default function Footer() {
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
              <Link href="/">
                <span className="sr-only">Home</span>
                <CompanyLogo className="text-white" />
              </Link>
            </div>

            <nav>
              <ul className="flex flex-wrap items-center gap-4">
                <li>
                  <Link href="/category/ENGINEERING" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="ghost"
                    >
                      Engineering
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/DESIGN" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="ghost"
                    >
                      Design
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/DATA_SCIENCE" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="ghost"
                    >
                      Data Science
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href="/category/LIFE_STYLE" passHref>
                    <Button
                      className="!font-normal"
                      color="light"
                      variant="ghost"
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
                      variant="ghost"
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
                      variant="ghost"
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
                    <Icon name="x" color="var(--color-base-white)" />
                  </div>
                </li>
                <li className="flex relative items-center gap-5">
                  <div className="after:content-[''] after:block after:absolute after:top-0 after:left-0 after:-z-10 after:rounded-full after:bg-white after:w-16 after:h-16 flex justify-center items-center w-16 h-16">
                    <Icon name="github" color="var(--color-base-white)" />
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
